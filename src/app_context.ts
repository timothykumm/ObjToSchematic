import "../styles.css";
import { AppAnalytics } from "./analytics";

import { FallableBehaviour } from "./block_mesh";
import { ArcballCamera } from "./camera";
import { AppConfig } from "./config";
import { MaterialType } from "./mesh";
import { EAppEvent, EventManager } from "./event";
import { LOC, Localiser, TLocalisedString } from "./localiser";
import { MaterialMapManager } from "./material-map";
import { MouseManager } from "./mouse";
import { MeshType, Renderer } from "./renderer";
import { AppConsole, TMessage } from "./ui/console";
import { UI } from "./ui/layout";
import { VueUIBridge } from "./ui/vue_bridge";
import { ColourSpace, EAction } from "./util";
import { ASSERT } from "./util/error_util";
import { download, downloadAsZip } from "./util/file_util";
import { LOG_ERROR, Logger } from "./util/log_util";
import { Vector3 } from "./vector";
import { WorkerController } from "./worker_controller";
import { TFromWorkerMessage } from "./worker_types";
import {
  TTexelInterpolation,
  TTexelExtension,
  TTransparencyOptions,
} from "./ui/types"; // Added

export class AppContext {
  /* Singleton */
  private static _instance: AppContext;
  public static get Get() {
    return this._instance || (this._instance = new this());
  }

  private _workerController: WorkerController;
  private _lastAction?: EAction;
  public minConstraint?: { x: number; z: number };
  public maxConstraint?: { x: number; z: number };
  private _materialManager: MaterialMapManager;
  private _loadedFilename: string | null;

  private constructor() {
    this._workerController = new WorkerController();
    this._materialManager = new MaterialMapManager(new Map());
    this._loadedFilename = null;
  }

  public static async init() {
    AppAnalytics.Init();

    await Localiser.Get.init();
    AppConsole.info(LOC("init.initialising"));

    Logger.Get.enableLOG();
    Logger.Get.enableLOGMAJOR();
    Logger.Get.enableLOGWARN();

    AppConfig.Get.dumpConfig();

    EventManager.Get.bindToContext(this.Get);

    // Initialize Vue UI Bridge
    VueUIBridge.Get.bindToContext(this.Get);
    VueUIBridge.Get.build();
    VueUIBridge.Get.registerEvents();
    VueUIBridge.Get.updateMaterials(this.Get._materialManager);
    VueUIBridge.Get.disableAll();

    ArcballCamera.Get.init();
    MouseManager.Get.init();

    window.addEventListener("contextmenu", (e) => e.preventDefault());

    this.Get._workerController
      .execute({ action: "Init", params: {} })
      .then(() => {
        VueUIBridge.Get.enableTo(EAction.Import);
        AppConsole.success(LOC("init.ready"));
      });

    ArcballCamera.Get.toggleAngleSnap();

    EventManager.Get.add(EAppEvent.onLanguageChanged, () => {
      this.Get._workerController
        .execute({
          action: "Settings",
          params: { language: Localiser.Get.getCurrentLanguage() },
        })
        .then(() => {});
    });
  }

  public getLastAction() {
    return this._lastAction;
  }

  public getVueUIBridge() {
    return VueUIBridge.Get;
  }

  // New method here
  public handleMaterialTypeChange(materialName: string, newType: MaterialType) {
    if (this._materialManager) {
      this._materialManager.changeMaterialType(materialName, newType);
      console.log(
        `[AppContext] Material type changed for '${materialName}' to ${newType}. Triggering UI update.`
      );
      VueUIBridge.Get.updateMaterials(this._materialManager);
    } else {
      console.error(
        "[AppContext] MaterialManager not initialized when trying to change material type."
      );
    }
  }

  // New method here
  public updateMaterialProperty(
    materialName: string,
    propertyName: string,
    value: any
  ) {
    if (this._materialManager) {
      this._materialManager.updateMaterialProperty(
        materialName,
        propertyName,
        value
      );
      console.log(
        `[AppContext] Property '${propertyName}' for material '${materialName}' updated. Triggering UI refresh.`
      );
      VueUIBridge.Get.updateMaterials(this._materialManager);
    } else {
      console.error(
        "[AppContext] MaterialManager not initialized when trying to update material property."
      );
    }
  }

  private async _import(): Promise<boolean> {
    // Gather data from the UI to send to the worker
    const components = VueUIBridge.Get.layout.import.components;
    let filetype: string;

    AppConsole.info(LOC("import.importing_mesh"));
    {
      // Instruct the worker to perform the job and await the result
      const file = components.input.getValue();
      filetype = file.type;

      const resultImport = await this._workerController.execute({
        action: "Import",
        params: {
          file: file,
          rotation: components.rotation.getValue(),
        },
      });

      VueUIBridge.Get.getActionButton(EAction.Import)?.resetLoading();
      if (this._handleErrors(resultImport)) {
        return false;
      }
      ASSERT(resultImport.action === "Import");

      AppConsole.success(LOC("import.imported_mesh"));
      this._addWorkerMessagesToConsole(resultImport.messages);

      VueUIBridge.Get._ui.voxelise.components.constraintAxis.setValue("y");
      VueUIBridge.Get._ui.voxelise.components.size.setValue(80);

      this.minConstraint = Vector3.copy(resultImport.result.dimensions)
        .mulScalar(AppConfig.Get.CONSTRAINT_MINIMUM_HEIGHT)
        .ceil();
      this.maxConstraint = Vector3.copy(resultImport.result.dimensions)
        .mulScalar(AppConfig.Get.CONSTRAINT_MAXIMUM_HEIGHT)
        .floor();

      VueUIBridge.Get._ui.voxelise.components.constraintAxis.setOptionEnabled(
        0,
        this.minConstraint.x > 0 && this.minConstraint.x <= this.maxConstraint.x
      );
      VueUIBridge.Get._ui.voxelise.components.constraintAxis.setOptionEnabled(
        2,
        this.minConstraint.z > 0 && this.minConstraint.z <= this.maxConstraint.z
      );

      // Restored original log, or a similar less verbose one.
      console.log("Import result materials:", resultImport.result.materials);
      let materialsData: Map<string, any> = resultImport.result.materials;
      if (!(materialsData instanceof Map)) {
        // Kept this more specific warning as it's useful.
        console.warn(
          "[AppContext._import] Warning: resultImport.result.materials from worker was not a Map instance. Using empty Map instead. Received type:",
          typeof materialsData,
          "Value:",
          materialsData
        );
        materialsData = new Map<string, any>();
      }

      if (materialsData.size === 0) {
        const defaultMaterialName = "default_material";
        // This specific log for creating the default material was requested to be kept.
        console.log(
          `[AppContext._import] No materials from worker. Creating default textured material: '${defaultMaterialName}'`
        );
        const defaultMaterial = {
          type: MaterialType.textured,
          name: defaultMaterialName,
          diffuse: undefined, // Optional: Explicitly undefined or remove if handled by consuming code
          interpolation: "linear" as TTexelInterpolation,
          extension: "repeat" as TTexelExtension,
          transparency: { type: "None" } as TTransparencyOptions, // Assuming TTransparencyOptions is compatible with {type: 'None'}
          canBeTextured: true, // Default for a new textured material
          needsAttention: true, // Flag for UI to highlight or auto-open this material
        };
        materialsData.set(defaultMaterialName, defaultMaterial);
      }

      this._materialManager = new MaterialMapManager(materialsData);
      console.log(
        "Created MaterialMapManager with size:",
        this._materialManager.materials.size
      ); // Restored original log
      VueUIBridge.Get.updateMaterials(this._materialManager);
      // The log for 'Called VueUIBridge.updateMaterials.' can be omitted to reduce verbosity further.

      this._loadedFilename = file.name.split(".")[0] ?? "result";
    }

    AppConsole.info(LOC("import.rendering_mesh"));
    {
      // Instruct the worker to perform the job and await the result
      const resultRender = await this._workerController.execute({
        action: "RenderMesh",
        params: {},
      });

      VueUIBridge.Get.getActionButton(EAction.Import)?.resetLoading();
      if (this._handleErrors(resultRender)) {
        return false;
      }
      ASSERT(resultRender.action === "RenderMesh");

      this._addWorkerMessagesToConsole(resultRender.messages);
      Renderer.Get.useMesh(resultRender.result);
    }
    AppConsole.success(LOC("import.rendered_mesh"));

    AppAnalytics.Event("import", {
      filetype: filetype,
    });
    return true;
  }

  private async _materials(): Promise<boolean> {
    AppConsole.info(LOC("materials.updating_materials"));
    {
      // Instruct the worker to perform the job and await the result
      const resultMaterials = await this._workerController.execute({
        action: "SetMaterials",
        params: {
          materials: this._materialManager.materials,
        },
      });

      VueUIBridge.Get.getActionButton(EAction.Materials)?.resetLoading();
      if (this._handleErrors(resultMaterials)) {
        return false;
      }
      ASSERT(resultMaterials.action === "SetMaterials");

      resultMaterials.result.materialsChanged.forEach((materialName) => {
        const material = this._materialManager.materials.get(materialName);
        ASSERT(material !== undefined);
        Renderer.Get.recreateMaterialBuffer(materialName, material);
        Renderer.Get.setModelToUse(MeshType.TriangleMesh);
      });

      this._addWorkerMessagesToConsole(resultMaterials.messages);
    }
    AppConsole.success(LOC("materials.updated_materials"));

    AppAnalytics.Event("materials");
    return true;
  }

  private async _voxelise(): Promise<boolean> {
    // Gather data from the UI to send to the worker
    const components = VueUIBridge.Get.layout.voxelise.components;

    AppConsole.info(LOC("voxelise.loading_voxel_mesh"));
    {
      // Instruct the worker to perform the job and await the result
      const resultVoxelise = await this._workerController.execute({
        action: "Voxelise",
        params: {
          constraintAxis: components.constraintAxis.getValue(),
          voxeliser: components.voxeliser.getValue(),
          size: components.size.getValue(),
          useMultisampleColouring: components.multisampleColouring.getValue(),
          enableAmbientOcclusion: components.ambientOcclusion.getValue(),
          voxelOverlapRule: components.voxelOverlapRule.getValue(),
        },
      });

      VueUIBridge.Get.getActionButton(EAction.Voxelise)?.resetLoading();
      if (this._handleErrors(resultVoxelise)) {
        return false;
      }
      ASSERT(resultVoxelise.action === "Voxelise");

      this._addWorkerMessagesToConsole(resultVoxelise.messages);
    }
    AppConsole.success(LOC("voxelise.loaded_voxel_mesh"));

    AppConsole.info(LOC("voxelise.rendering_voxel_mesh"));
    {
      let moreVoxelsToBuffer = false;
      do {
        // Instruct the worker to perform the job and await the result
        const resultRender = await this._workerController.execute({
          action: "RenderNextVoxelMeshChunk",
          params: {
            enableAmbientOcclusion: components.ambientOcclusion.getValue(),
            desiredHeight: components.size.getValue(),
          },
        });

        VueUIBridge.Get.getActionButton(EAction.Voxelise)?.resetLoading();
        if (this._handleErrors(resultRender)) {
          return false;
        }
        ASSERT(resultRender.action === "RenderNextVoxelMeshChunk");

        moreVoxelsToBuffer = resultRender.result.moreVoxelsToBuffer;
        this._addWorkerMessagesToConsole(resultRender.messages);

        Renderer.Get.useVoxelMeshChunk(resultRender.result);
      } while (moreVoxelsToBuffer);
    }
    AppConsole.success(LOC("voxelise.rendered_voxel_mesh"));

    AppAnalytics.Event("voxelise", {
      constraintAxis: components.constraintAxis.getValue(),
      voxeliser: components.voxeliser.getValue(),
      size: components.size.getValue(),
      useMultisampleColouring: components.multisampleColouring.getValue(),
      enableAmbientOcclusion: components.ambientOcclusion.getValue(),
      voxelOverlapRule: components.voxelOverlapRule.getValue(),
    });
    return true;
  }

  private async _assign(): Promise<boolean> {
    // Gather data from the UI to send to the worker
    const components = VueUIBridge.Get.layout.assign.components;

    AppConsole.info(LOC("assign.loading_block_mesh"));
    {
      // Instruct the worker to perform the job and await the result
      const resultAssign = await this._workerController.execute({
        action: "Assign",
        params: {
          textureAtlas: components.textureAtlas.getValue(),
          blockPalette: components.blockPalette.getValue().getBlocks(),
          dithering: components.dithering.getValue(),
          ditheringMagnitude: components.ditheringMagnitude.getValue(),
          colourSpace: ColourSpace.RGB,
          fallable: components.fallable.getValue() as FallableBehaviour,
          resolution: Math.pow(2, components.colourAccuracy.getValue()),
          calculateLighting: components.calculateLighting.getValue(),
          lightThreshold: components.lightThreshold.getValue(),
          contextualAveraging: components.contextualAveraging.getValue(),
          errorWeight: components.errorWeight.getValue() / 10,
        },
      });

      VueUIBridge.Get.getActionButton(EAction.Assign)?.resetLoading();
      if (this._handleErrors(resultAssign)) {
        return false;
      }
      ASSERT(resultAssign.action === "Assign");

      this._addWorkerMessagesToConsole(resultAssign.messages);
    }
    AppConsole.success(LOC("assign.loaded_block_mesh"));

    Renderer.Get.setLightingAvailable(components.calculateLighting.getValue());

    AppConsole.info(LOC("assign.rendering_block_mesh"));
    {
      let moreBlocksToBuffer = false;
      do {
        // Instruct the worker to perform the job and await the result
        const resultRender = await this._workerController.execute({
          action: "RenderNextBlockMeshChunk",
          params: {
            textureAtlas: components.textureAtlas.getValue(),
          },
        });

        VueUIBridge.Get.getActionButton(EAction.Assign)?.resetLoading();
        if (this._handleErrors(resultRender)) {
          return false;
        }
        ASSERT(resultRender.action === "RenderNextBlockMeshChunk");

        moreBlocksToBuffer = resultRender.result.moreBlocksToBuffer;
        this._addWorkerMessagesToConsole(resultRender.messages);

        Renderer.Get.useBlockMeshChunk(resultRender.result);
      } while (moreBlocksToBuffer);
    }
    AppConsole.success(LOC("assign.rendered_block_mesh"));

    AppAnalytics.Event("assign", {
      dithering: components.dithering.getValue(),
      ditheringMagnitude: components.ditheringMagnitude.getValue(),
      fallable: components.fallable.getValue() as FallableBehaviour,
      resolution: Math.pow(2, components.colourAccuracy.getValue()),
      calculateLighting: components.calculateLighting.getValue(),
      lightThreshold: components.lightThreshold.getValue(),
      contextualAveraging: components.contextualAveraging.getValue(),
      errorWeight: components.errorWeight.getValue() / 10,
    });
    return true;
  }

  private async _export(): Promise<boolean> {
    // Gather data from the UI to send to the worker
    const components = VueUIBridge.Get.layout.export.components;

    AppConsole.info(LOC("export.exporting_structure"));
    {
      // ---- START MODIFICATION ----
      const exporterValueFromUI = components.export.getValue();
      console.log(
        "[AppContext._export] DIAGNOSTIC: Value from components.export.getValue() =",
        exporterValueFromUI,
        "; typeof =",
        typeof exporterValueFromUI
      );
      // ---- END MODIFICATION ----

      // Instruct the worker to perform the job and await the result
      const resultExport = await this._workerController.execute({
        action: "Export",
        params: {
          exporter: exporterValueFromUI, // Ensure this uses the new variable
        },
      });

      VueUIBridge.Get.getActionButton(EAction.Export)?.resetLoading();
      if (this._handleErrors(resultExport)) {
        return false;
      }
      ASSERT(resultExport.action === "Export");

      this._addWorkerMessagesToConsole(resultExport.messages);

      ASSERT(this._loadedFilename !== null);
      const fileExport = resultExport.result.files;
      if (fileExport.type === "single") {
        download(
          fileExport.content,
          `${this._loadedFilename}_OTS${fileExport.extension}`
        );
      } else {
        const zipFiles = fileExport.regions.map((region) => {
          // .nbt exports need to be lowercase
          return {
            content: region.content,
            filename: `ots_${region.name}${fileExport.extension}`,
          };
        });

        downloadAsZip(`${this._loadedFilename}_OTS.zip`, zipFiles);
      }
    }
    AppConsole.success(LOC("export.exported_structure"));

    AppAnalytics.Event("export", {
      exporter: components.export.getValue(),
    });
    return true;
  }

  /**
   * Check if the result from the worker is an error message
   * if so, handle it and return true, otherwise false.
   */
  private _handleErrors(result: TFromWorkerMessage) {
    if (result.action === "KnownError") {
      AppConsole.error(result.error.message as TLocalisedString);
      return true;
    } else if (result.action === "UnknownError") {
      AppConsole.error(LOC("something_went_wrong"));
      LOG_ERROR(result.error);
      return true;
    }
    return false;
  }

  public async do(action: EAction) {
    // Disable the UI while the worker is working
    VueUIBridge.Get.disableAll();

    this._lastAction = action;

    const success = await this._executeAction(action);
    if (success) {
      if (action === EAction.Import) {
        // After import, enable Materials and Voxelise
        VueUIBridge.Get.enableTo(EAction.Voxelise);
        console.log("Actions enabled after import:", {
          Settings: VueUIBridge.Get.isEnabled(EAction.Settings),
          Import: VueUIBridge.Get.isEnabled(EAction.Import),
          Materials: VueUIBridge.Get.isEnabled(EAction.Materials),
          Voxelise: VueUIBridge.Get.isEnabled(EAction.Voxelise),
          Assign: VueUIBridge.Get.isEnabled(EAction.Assign),
          Export: VueUIBridge.Get.isEnabled(EAction.Export),
        });
      } else {
        VueUIBridge.Get.enableTo(action + 1);
      }
    } else {
      VueUIBridge.Get.enableTo(action);
    }
  }

  private _addWorkerMessagesToConsole(messages: TMessage[]) {
    messages.forEach((message) => {
      AppConsole.add(message);
    });
  }

  private async _executeAction(action: EAction): Promise<boolean> {
    switch (action) {
      case EAction.Import:
        return await this._import();
      case EAction.Materials:
        return await this._materials();
      case EAction.Voxelise:
        return await this._voxelise();
      case EAction.Assign:
        return await this._assign();
      case EAction.Export:
        return await this._export();
    }
    ASSERT(false);
  }

  public static draw() {
    Renderer.Get.update();
    VueUIBridge.Get.tick(this.Get._workerController.isBusy());
    Renderer.Get.draw();
  }
}
