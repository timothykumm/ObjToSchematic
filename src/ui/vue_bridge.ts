import { reactive, ref } from 'vue';
import { EAction } from '../util';
import { TLocalisedString } from '../localiser';
import { MaterialMapManager } from '../material-map';
import { Palette } from '../palette';
import { PALETTE_ALL_RELEASE } from '../../res/palettes/all';

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
    export: {}
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
    this.setComponentValue('assign', 'blockPalette', defaultPalette);
    this.setComponentValue('assign', 'textureAtlas', 'vanilla');
    this.setComponentValue('assign', 'dithering', 'ordered');
    this.setComponentValue('assign', 'ditheringMagnitude', 32);
    this.setComponentValue('assign', 'fallable', 'replace-falling');
    this.setComponentValue('assign', 'colourAccuracy', 5);
    this.setComponentValue('assign', 'calculateLighting', false);
    this.setComponentValue('assign', 'lightThreshold', 1);
    this.setComponentValue('assign', 'contextualAveraging', true);
    this.setComponentValue('assign', 'errorWeight', 0.2);
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
    Object.keys(this.enabledActions).forEach(key => {
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
    // Convert materials to UI format
    const materialsArray: any[] = [];
    console.log('updateMaterials called, materials map size:', materialManager.materials.size);
    materialManager.materials.forEach((material, name) => {
      console.log('Processing material:', name, material);
      materialsArray.push({
        name,
        type: material.type,
        // Add color based on material type
        colour: (material as any).colour || (material as any).color || null,
        // Add other material properties as needed
      });
    });
    console.log('Final materials array:', materialsArray);
    this.materials.value = materialsArray;
  }

  // Legacy compatibility methods to replace UI.Get calls
  public getActionButton(action: EAction) {
    return {
      resetLoading: () => this.setActionLoading(action, false),
      setProgress: (progress: number) => {
        // TODO: Implement progress tracking if needed
        // Could update a reactive progress value here
      }
    };
  }

  public get layout() {
    // Compatibility layer for UI.Get.layout calls
    return {
      import: {
        components: {
          input: {
            getValue: () => this.getComponentValue('import', 'input')
          },
          rotation: {
            getValue: () => this.getComponentValue('import', 'rotation')
          }
        }
      },
      voxelise: {
        components: {
          constraintAxis: {
            getValue: () => this.getComponentValue('voxelise', 'constraintAxis'),
            setValue: (value: any) => this.setComponentValue('voxelise', 'constraintAxis', value),
            setOptionEnabled: (index: number, enabled: boolean) => {
              // TODO: Implement option enabling/disabling
              // Could update reactive option states here
            }
          },
          size: {
            getValue: () => this.getComponentValue('voxelise', 'size'),
            setValue: (value: any) => this.setComponentValue('voxelise', 'size', value)
          },
          useMultisampleColouring: {
            getValue: () => this.getComponentValue('voxelise', 'useMultisampleColouring')
          },
          voxeliser: {
            getValue: () => this.getComponentValue('voxelise', 'voxeliser')
          },
          ambientOcclusion: {
            getValue: () => this.getComponentValue('voxelise', 'ambientOcclusion')
          },
          enableMultisample: {
            getValue: () => this.getComponentValue('voxelise', 'enableMultisample')
          },
          textureFiltering: {
            getValue: () => this.getComponentValue('voxelise', 'textureFiltering')
          },
          enableTextures: {
            getValue: () => this.getComponentValue('voxelise', 'enableTextures')
          },
          multisampleColouring: {
            getValue: () => this.getComponentValue('voxelise', 'multisampleColouring')
          },
          voxelOverlapRule: {
            getValue: () => this.getComponentValue('voxelise', 'voxelOverlapRule')
          }
        }
      },
      assign: {
        components: {
          textureAtlas: {
            getValue: () => this.getComponentValue('assign', 'textureAtlas')
          },
          blockPalette: {
            getValue: () => this.getComponentValue('assign', 'blockPalette')
          },
          dithering: {
            getValue: () => this.getComponentValue('assign', 'dithering')
          },
          colourSpace: {
            getValue: () => this.getComponentValue('assign', 'colourSpace')
          },
          fallable: {
            getValue: () => this.getComponentValue('assign', 'fallable')
          },
          resolution: {
            getValue: () => this.getComponentValue('assign', 'resolution')
          },
          calculateLighting: {
            getValue: () => this.getComponentValue('assign', 'calculateLighting')
          },
          lightThreshold: {
            getValue: () => this.getComponentValue('assign', 'lightThreshold')
          },
          ditheringMagnitude: {
            getValue: () => this.getComponentValue('assign', 'ditheringMagnitude')
          },
          colourAccuracy: {
            getValue: () => this.getComponentValue('assign', 'colourAccuracy')
          },
          contextualAveraging: {
            getValue: () => this.getComponentValue('assign', 'contextualAveraging')
          },
          errorWeight: {
            getValue: () => this.getComponentValue('assign', 'errorWeight')
          }
        }
      },
      export: {
        components: {
          export: {
            getValue: () => this.getComponentValue('export', 'export')
          }
        }
      }
    };
  }

  public get _ui() {
    // Direct access to UI components for setValue calls
    return {
      voxelise: {
        components: {
          constraintAxis: {
            setValue: (value: any) => this.setComponentValue('voxelise', 'constraintAxis', value),
            setOptionEnabled: (index: number, enabled: boolean) => {
              // TODO: Implement constraint axis option enabling/disabling
              // Could update reactive option states here
            }
          },
          size: {
            setValue: (value: any) => this.setComponentValue('voxelise', 'size', value)
          }
        }
      }
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