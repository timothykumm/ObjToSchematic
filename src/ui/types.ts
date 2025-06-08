import { TLocalisedKey } from '../localiser';

// Import directly and then re-export
import { RGBA as CoreRGBA } from '../colour';
import {
    MaterialType as CoreMaterialTypeEnum,
    SolidMaterial as CoreSolidMaterialDef,
    TexturedMaterial as CoreTexturedMaterialDef
} from '../mesh';
import {
    EImageChannel as CoreEImageChannelEnum,
    TImageFiletype as CoreTImageFiletype,
    TImageRawWrap as CoreTImageRawWrap,
    TTransparencyTypes as CoreTTransparencyTypes,
    TTransparencyOptions as CoreTTransparencyOptions
} from '../texture';
import {
    TAxis as CoreTAxis,
    TTexelInterpolation as CoreTTexelInterpolation,
    TTexelExtension as CoreTTexelExtension
} from '../util/type_util';

// Re-export types
export type RGBA = CoreRGBA;
export type SolidMaterialDef = CoreSolidMaterialDef;
export type TexturedMaterialDef = CoreTexturedMaterialDef;
export type TImageFiletype = CoreTImageFiletype;
export type TImageRawWrap = CoreTImageRawWrap;
export type TTransparencyTypes = CoreTTransparencyTypes;
export type TTransparencyOptions = CoreTTransparencyOptions;
export type TAxis = CoreTAxis;
export type TTexelInterpolation = CoreTTexelInterpolation;
export type TTexelExtension = CoreTTexelExtension;

// Re-export enums as both type and value
export type MaterialType = CoreMaterialTypeEnum;
export const MaterialType = CoreMaterialTypeEnum;

export type EImageChannel = CoreEImageChannelEnum;
export const EImageChannel = CoreEImageChannelEnum;

// UI-specific types (defined here)
export type ComboboxItem<T = any> = {
  payload: T;
  displayLocKey?: TLocalisedKey;
  displayText?: string;
  disabled?: boolean;
};

export interface Vector3Value {
  x: number;
  y: number;
  z: number;
}

export interface ImageInputValue {
  raw: string; // base64 data URL
  filetype: 'png' | 'jpg';
}

export type TVoxelisers = 'ray-based' | 'bvh-ray' | 'ncrb';
export type TVoxelOverlapRule = 'average' | 'first';
export type FallableBehaviour = 'replace-falling' | 'replace-fallable' | 'do-nothing';

// Composite UI data types
export interface BaseMaterialUIData {
  type: MaterialType; // This refers to the type MaterialType = CoreMaterialTypeEnum;
  name?: string;
  canBeTextured?: boolean;
}

export interface SolidMaterialUIData extends BaseMaterialUIData {
  type: CoreMaterialTypeEnum.solid; // Explicitly use the imported Enum value for literal type
  colour: RGBA;
}

export interface TexturedMaterialUIData extends BaseMaterialUIData {
  type: CoreMaterialTypeEnum.textured; // Explicitly use the imported Enum value for literal type
  diffuseMap: ImageInputValue | null;
  interpolation: TTexelInterpolation;
  extension: TTexelExtension;
  transparency: {
    type: TTransparencyTypes;
    alphaValue?: number;
    alphaMap?: ImageInputValue | null;
    alphaChannel?: EImageChannel; // This refers to the type EImageChannel = CoreEImageChannelEnum
  };
}

export type MaterialUIData = SolidMaterialUIData | TexturedMaterialUIData;
