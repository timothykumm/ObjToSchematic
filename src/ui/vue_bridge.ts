import { reactive, ref } from "vue";
import { EAction } from "../util";
import { TLocalisedString } from "../localiser";
import { MaterialMapManager } from "../material-map";
import {
  MaterialUIData,
  SolidMaterialUIData,
  TexturedMaterialUIData,
  BaseMaterialUIData,
  MaterialType,
  RGBA,
} from "./types";
import { Palette } from "../palette";
import { PALETTE_ALL_RELEASE } from "../../res/palettes/all";

export interface VueUIState {
  isEnabled: (action: EAction) => boolean;
  enableTo: (action: EAction) => void;
  disableAll: () => void;
  setActionLoading: (action: EAction, loading: boolean) => void;
  getComponentValue: (section: string, component: string) => any;
  setComponentValue: (section: string, component: string, value: any) => void;
  updateMaterials: (materialManager: MaterialMapManager) => void;
}

class VueUIBridge implements VueUIState {
  private static _instance: VueUIBridge;
  public static get Get() {
    return this._instance || (this._instance = new this());
  }

  // Reactive state
  public enabledActions = reactive<Record<EAction, boolean>>({
    [EAction.Settings]: false,
    [EAction.Import]: false,
    [EAction.Materials]: false,
    [EAction.Voxelise]: false,
    [EAction.Assign]: false,
    [EAction.Export]: false,
    [EAction.MAX]: false,
  });

  public loadingActions = reactive<Record<EAction, boolean>>({
    [EAction.Settings]: false,
    [EAction.Import]: false,
    [EAction.Materials]: false,
    [EAction.Voxelise]: false,
    [EAction.Assign]: false,
    [EAction.Export]: false,
    [EAction.MAX]: false,
  });

  // Component values storage
  public componentValues = reactive<Record<string, Record<string, any>>>({
    settings: {},
    import: {},
    materials: {},
    voxelise: {},
    assign: {},
    export: {},
  });

  // Materials state
  public materials = ref<any[]>([]);

  private constructor() {
    // Initialize with all actions disabled
    this.disableAll();

    // Initialize blockPalette with default palette
    this.initializeDefaultComponents();
  }

  private initializeDefaultComponents(): void {
    const defaultPalette = Palette.create();
    defaultPalette.add(PALETTE_ALL_RELEASE);
    this.setComponentValue("assign", "blockPalette", defaultPalette);
    this.setComponentValue("assign", "textureAtlas", "vanilla");
    this.setComponentValue("assign", "dithering", "ordered");
    this.setComponentValue("assign", "ditheringMagnitude", 32);
    this.setComponentValue("assign", "fallable", "replace-falling");
    this.setComponentValue("assign", "colourAccuracy", 5);
    this.setComponentValue("assign", "calculateLighting", false);
    this.setComponentValue("assign", "lightThreshold", 1);
    this.setComponentValue("assign", "contextualAveraging", true);
    this.setComponentValue("assign", "errorWeight", 0.2);
  }

  isEnabled(action: EAction): boolean {
    return this.enabledActions[action];
  }

  enableTo(action: EAction): void {
    for (let i = 0; i <= action; i++) {
      this.enabledActions[i as EAction] = true;
    }
  }

  disableAll(): void {
    Object.keys(this.enabledActions).forEach((key) => {
      this.enabledActions[parseInt(key) as EAction] = false;
    });
  }

  setActionLoading(action: EAction, loading: boolean): void {
    this.loadingActions[action] = loading;
  }

  getComponentValue(section: string, component: string): any {
    return this.componentValues[section]?.[component];
  }

  setComponentValue(section: string, component: string, value: any): void {
    if (!this.componentValues[section]) {
      this.componentValues[section] = {};
    }
    this.componentValues[section][component] = value;
  }

  updateMaterials(materialManager: MaterialMapManager): void {
    const newMaterialsArray: MaterialUIData[] = [];
    // console.log('[VueUIBridge.updateMaterials] Called. Input materials map size:', materialManager.materials.size); // REMOVED

    if (materialManager.materials.size > 0) {
      materialManager.materials.forEach((coreMaterial: any, name: string) => {
        // console.log(`[VueUIBridge.updateMaterials] Processing coreMaterial - Name: '${name}', Type: ${coreMaterial.type}, Data:`, coreMaterial ? JSON.parse(JSON.stringify(coreMaterial)) : 'undefined/null'); // REMOVED
        let uiMaterial: MaterialUIData | null = null;

        if (coreMaterial.type === MaterialType.solid) {
          uiMaterial = {
            name,
            type: MaterialType.solid,
            colour: coreMaterial.colour || ({ r: 1, g: 1, b: 1, a: 1 } as RGBA),
            canBeTextured:
              coreMaterial.canBeTextured !== undefined
                ? coreMaterial.canBeTextured
                : true,
          } as SolidMaterialUIData;
        } else if (coreMaterial.type === MaterialType.textured) {
          const transparencyData = coreMaterial.transparency || {
            type: "None",
          };
          uiMaterial = {
            name: coreMaterial.name || name,
            type: MaterialType.textured,
            canBeTextured: true,
            diffuseMap: coreMaterial.diffuseMap || coreMaterial.diffuse || null,
            interpolation: coreMaterial.interpolation || "linear",
            extension: coreMaterial.extension || "repeat",
            transparency: {
              type: transparencyData.type || "None",
              alphaValue: transparencyData.alphaValue,
              alphaMap: transparencyData.alphaMap || null,
              alphaChannel: transparencyData.alphaChannel,
            },
          } as TexturedMaterialUIData;
        } else {
          // console.warn(`[VueUIBridge.updateMaterials] Unknown material type for '${name}':`, coreMaterial.type); // Keep this warn? For now, removing all.
          uiMaterial = {
            name,
            type: coreMaterial.type,
            canBeTextured: false,
          } as BaseMaterialUIData;
        }

        if (uiMaterial) {
          // console.log(`[VueUIBridge.updateMaterials] Created uiMaterial for '${uiMaterial.name}':`, uiMaterial ? JSON.parse(JSON.stringify(uiMaterial)) : 'undefined/null'); // REMOVED
          newMaterialsArray.push(uiMaterial);
        }
      });
    } else {
      // console.log('[VueUIBridge.updateMaterials] Received empty materials map from MaterialMapManager.'); // REMOVED
    }

    // REMOVED --- UI-VISIBLE DEBUG DATA ---
    // const debugMaterial: SolidMaterialUIData = {
    //     name: "---DEBUG_MATERIAL_TEST---",
    //     type: MaterialType.solid,
    //     colour: { r: 1.0, g: 0.0, b: 1.0, a: 1.0 } as RGBA,
    //     canBeTextured: false
    // };
    // newMaterialsArray.push(debugMaterial);
    // console.log('[VueUIBridge.updateMaterials] Added hardcoded ---DEBUG_MATERIAL_TEST---.'); // REMOVED
    // --- END UI-VISIBLE DEBUG DATA ---

    // console.log('[VueUIBridge.updateMaterials] Final newMaterialsArray to be assigned (snapshot):', newMaterialsArray ? JSON.parse(JSON.stringify(newMaterialsArray)) : 'undefined/null'); // REMOVED
    this.materials.value = newMaterialsArray;
    // console.log('[VueUIBridge.updateMaterials] this.materials.value updated.'); // REMOVED
  }

  // Legacy compatibility methods to replace UI.Get calls
  public getActionButton(action: EAction) {
    return {
      resetLoading: () => this.setActionLoading(action, false),
      setProgress: (progress: number) => {
        // TODO: Implement progress tracking if needed
        // Could update a reactive progress value here
      },
    };
  }

  public get layout() {
    // Compatibility layer for UI.Get.layout calls
    return {
      import: {
        components: {
          input: {
            getValue: () => this.getComponentValue("import", "input"),
          },
          rotation: {
            getValue: () => this.getComponentValue("import", "rotation"),
          },
        },
      },
      voxelise: {
        components: {
          constraintAxis: {
            getValue: () =>
              this.getComponentValue("voxelise", "constraintAxis"),
            setValue: (value: any) =>
              this.setComponentValue("voxelise", "constraintAxis", value),
            setOptionEnabled: (index: number, enabled: boolean) => {
              // TODO: Implement option enabling/disabling
              // Could update reactive option states here
            },
          },
          size: {
            getValue: () => this.getComponentValue("voxelise", "size"),
            setValue: (value: any) =>
              this.setComponentValue("voxelise", "size", value),
          },
          useMultisampleColouring: {
            getValue: () =>
              this.getComponentValue("voxelise", "useMultisampleColouring"),
          },
          voxeliser: {
            getValue: () => this.getComponentValue("voxelise", "voxeliser"),
          },
          ambientOcclusion: {
            getValue: () =>
              this.getComponentValue("voxelise", "ambientOcclusion"),
          },
          enableMultisample: {
            getValue: () =>
              this.getComponentValue("voxelise", "enableMultisample"),
          },
          textureFiltering: {
            getValue: () =>
              this.getComponentValue("voxelise", "textureFiltering"),
          },
          enableTextures: {
            getValue: () =>
              this.getComponentValue("voxelise", "enableTextures"),
          },
          multisampleColouring: {
            getValue: () =>
              this.getComponentValue("voxelise", "multisampleColouring"),
          },
          voxelOverlapRule: {
            getValue: () =>
              this.getComponentValue("voxelise", "voxelOverlapRule"),
          },
        },
      },
      assign: {
        components: {
          textureAtlas: {
            getValue: () => this.getComponentValue("assign", "textureAtlas"),
          },
          blockPalette: {
            getValue: () => this.getComponentValue("assign", "blockPalette"),
          },
          dithering: {
            getValue: () => this.getComponentValue("assign", "dithering"),
          },
          colourSpace: {
            getValue: () => this.getComponentValue("assign", "colourSpace"),
          },
          fallable: {
            getValue: () => this.getComponentValue("assign", "fallable"),
          },
          resolution: {
            getValue: () => this.getComponentValue("assign", "resolution"),
          },
          calculateLighting: {
            getValue: () =>
              this.getComponentValue("assign", "calculateLighting"),
          },
          lightThreshold: {
            getValue: () => this.getComponentValue("assign", "lightThreshold"),
          },
          ditheringMagnitude: {
            getValue: () =>
              this.getComponentValue("assign", "ditheringMagnitude"),
          },
          colourAccuracy: {
            getValue: () => this.getComponentValue("assign", "colourAccuracy"),
          },
          contextualAveraging: {
            getValue: () =>
              this.getComponentValue("assign", "contextualAveraging"),
          },
          errorWeight: {
            getValue: () => this.getComponentValue("assign", "errorWeight"),
          },
        },
      },
      export: {
        components: {
          export: {
            getValue: () => this.getComponentValue("export", "export"),
          },
        },
      },
    };
  }

  public get _ui() {
    // Direct access to UI components for setValue calls
    return {
      voxelise: {
        components: {
          constraintAxis: {
            setValue: (value: any) =>
              this.setComponentValue("voxelise", "constraintAxis", value),
            setOptionEnabled: (index: number, enabled: boolean) => {
              // TODO: Implement constraint axis option enabling/disabling
              // Could update reactive option states here
            },
          },
          size: {
            setValue: (value: any) =>
              this.setComponentValue("voxelise", "size", value),
          },
        },
      },
    };
  }

  // Method to sync Vue component states
  public bindToContext(appContext: any) {
    // Vue bridge is now bound to context
  }

  public build() {
    // Vue components handle their own building
  }

  public registerEvents() {
    // Vue components handle their own event registration
  }

  public tick(isBusy: boolean) {
    // Update any time-based UI state
    // Could be used for animations, progress updates, etc.
    // For now, silent operation - no console spam
  }
}

export { VueUIBridge };
