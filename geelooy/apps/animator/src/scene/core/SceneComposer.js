// B"H
import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';
import { SceneRenderContext } from './SceneRenderContext.js';
import { SCENE_LAYER_REGISTRY } from './SceneLayerRegistry.js';
import { ProductionLunchScene } from '../render/production/ProductionLunchScene.js';

/**
 * SceneComposer now chooses authored-world by default. The old skyline registry
 * is only reachable through explicit `legacy_layers` scene style.
 */
export class SceneComposer {
  static build(args = {}) {
    const context = SceneRenderContext.create(args);
    const style = context.sceneData?.style;
    if (style !== 'legacy_layers') {
      console.log?.('B"H - [SceneComposer] Rendering authored world proof scene.', style || 'default');
      return ProductionLunchScene.build(context);
    }

    const children = [];
    for (const Layer of SCENE_LAYER_REGISTRY) {
      const node = Layer.build(context);
      if (node) children.push(node);
    }
    return G.group('scene_composer_root', null, children);
  }
}
