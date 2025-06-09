import { RGBAColours, RGBAUtil, RGBA } from "./colour"; // Added RGBA
import { MaterialMap, MaterialType } from "./mesh";
// SolidMaterial and TexturedMaterial might be needed if we cast `material` for direct property access,
// but can often be avoided by checking material.type and accessing properties carefully.
// For this implementation, direct access after type check is fine.
import {
  EImageChannel,
  TTransparencyTypes,
  TImageRawWrap,
  TTransparencyOptions,
} from "./texture"; // Added TImageRawWrap, TTransparencyOptions
import { ASSERT } from "./util/error_util";
import { TTexelInterpolation, TTexelExtension } from "./util/type_util"; // Added

export class MaterialMapManager {
  public materials: MaterialMap;

  public constructor(materials: MaterialMap) {
    this.materials = materials;
  }

  public changeTransparencyType(
    materialName: string,
    newTransparencyType: TTransparencyTypes
  ) {
    const currentMaterial = this.materials.get(materialName);
    ASSERT(
      currentMaterial !== undefined,
      "Cannot change transparency type of non-existent material"
    );
    ASSERT(currentMaterial.type === MaterialType.textured);

    switch (newTransparencyType) {
      case "None":
        currentMaterial.transparency = { type: "None" };
        break;
      case "UseAlphaMap":
        currentMaterial.transparency = {
          type: "UseAlphaMap",
          alpha: undefined,
          channel: EImageChannel.R,
        };
        break;
      case "UseAlphaValue":
        currentMaterial.transparency = {
          type: "UseAlphaValue",
          alpha: 1.0,
        };
        break;
      case "UseDiffuseMapAlphaChannel":
        currentMaterial.transparency = {
          type: "UseDiffuseMapAlphaChannel",
        };
        break;
    }

    this.materials.set(materialName, currentMaterial);
  }

  /**
   * Convert a material to a new type, i.e. textured to solid.
   * Will return if the material is already the given type.
   */
  public changeMaterialType(
    materialName: string,
    newMaterialType: MaterialType
  ) {
    const currentMaterial = this.materials.get(materialName);
    ASSERT(
      currentMaterial !== undefined,
      "Cannot change material type of non-existent material"
    );

    if (currentMaterial.type === newMaterialType) {
      return;
    }

    switch (newMaterialType) {
      case MaterialType.solid:
        ASSERT(
          currentMaterial.type === MaterialType.textured,
          "Old material expect to be texture"
        );
        this.materials.set(materialName, {
          type: MaterialType.solid,
          colour: RGBAUtil.randomPretty(),
          canBeTextured: true,
          needsAttention: true,
        });
        break;
      case MaterialType.textured:
        ASSERT(
          currentMaterial.type === MaterialType.solid,
          "Old material expect to be solid"
        );
        this.materials.set(materialName, {
          type: MaterialType.textured,
          transparency: {
            type: "None",
          },
          extension: "repeat",
          interpolation: "linear",
          needsAttention: true,
          diffuse: undefined,
        });
        break;
    }
  }

  public updateMaterialProperty(
    materialName: string,
    propertyName: string,
    value: any
  ) {
    const material = this.materials.get(materialName);
    if (!material) {
      console.error(
        `[MaterialMapManager] Material '${materialName}' not found for update.`
      );
      return;
    }

    console.log(
      `[MaterialMapManager] Updating '${propertyName}' for material '${materialName}' with value:`,
      value
    );

    material.needsAttention = true; // Mark as changed

    if (material.type === MaterialType.textured) {
      // Cast to TexturedMaterial for type safety, assuming TexturedMaterial is imported from ./mesh
      const texturedMaterial = material as import("./mesh").TexturedMaterial;
      switch (propertyName) {
        case "diffuseMap":
          texturedMaterial.diffuse = value as TImageRawWrap; // value is ImageInputValue, compatible with TImageRawWrap
          break;
        case "interpolation":
          texturedMaterial.interpolation = value as TTexelInterpolation;
          break;
        case "extension":
          texturedMaterial.extension = value as TTexelExtension;
          break;
        case "transparency":
          // 'value' here is the complete new transparency settings object from MaterialItem.vue (format: TexturedMaterialUIData['transparency'])
          const uiTransparencySettings = value as {
            type: TTransparencyTypes;
            alphaValue?: number;
            alphaMap?: TImageRawWrap | null;
            alphaChannel?: EImageChannel;
          };
          let coreTransparencyOption: TTransparencyOptions;

          if (uiTransparencySettings.type === "UseAlphaValue") {
            coreTransparencyOption = {
              type: "UseAlphaValue",
              alpha:
                uiTransparencySettings.alphaValue !== undefined
                  ? uiTransparencySettings.alphaValue
                  : 1.0,
            };
          } else if (uiTransparencySettings.type === "UseAlphaMap") {
            coreTransparencyOption = {
              type: "UseAlphaMap",
              alpha: uiTransparencySettings.alphaMap || undefined, // Assign if present, else undefined
              channel: uiTransparencySettings.alphaChannel || EImageChannel.R,
            };
          } else {
            // Handles 'None' and 'UseDiffuseMapAlphaChannel'
            coreTransparencyOption = { type: uiTransparencySettings.type };
          }
          texturedMaterial.transparency = coreTransparencyOption;
          break;
        default:
          console.warn(
            `[MaterialMapManager] Unhandled property '${propertyName}' for textured material '${materialName}'.`
          );
          material.needsAttention = false; // Revert if property is not actually handled
          return;
      }
    } else if (material.type === MaterialType.solid) {
      // Cast to SolidMaterial for type safety, assuming SolidMaterial is imported from ./mesh
      const solidMaterial = material as import("./mesh").SolidMaterial;
      switch (propertyName) {
        case "colour":
          solidMaterial.colour = value as RGBA;
          break;
        default:
          console.warn(
            `[MaterialMapManager] Unhandled property '${propertyName}' for solid material '${materialName}'.`
          );
          material.needsAttention = false; // Revert
          return;
      }
    } else {
      console.error(
        `[MaterialMapManager] Unknown material type for '${materialName}'. Type: ${material.type}`
      );
      material.needsAttention = false; // Revert
      return;
    }

    this.materials.set(materialName, material); // material object was modified directly, this ensures map is updated if it was a copy (though JS objects are by reference)
    console.log(
      `[MaterialMapManager] Material '${materialName}' updated:`,
      material
    );
  }
}
