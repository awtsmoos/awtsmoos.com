
// B"H
import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StackProcessor } from '../../../engine/logic/modifiers/StackProcessor.js';
import { SkyGradientBuilder } from '../../../world/generation/sky/SkyGradientBuilder.js';
import { PropGraphBuilder } from '../../../world/builders/PropGraphBuilder.js';
import { SceneEnvironmentBuilder } from '../../../engine/reality/scene/SceneEnvironmentBuilder.js';

export class SceneGraphBuilder {
  static build(sceneData, width, height, realTime, directorTime, camera, activeSequence, state) {
    const camX = camera.x || 0;
    const camY = camera.y || 0;
    const zoom = camera.zoom || 1;
    const cx = width / 2;
    const cy = height / 2;

    const timeOfDay = sceneData?.timeOfDay || 0.3; 

    const heavens = G.group('heavens', { x: 0, y: -cy/zoom + camY }, [
       SkyGradientBuilder.build(timeOfDay, 100000, 100000)
    ]);

    const environmentNodes = SceneEnvironmentBuilder.build(sceneData, timeOfDay, realTime, camera, width);

    const rawProps = sceneData.props || [];
    const baseNodes = PropGraphBuilder.buildAll(rawProps, state, realTime);
    
    const manifestProps = [];
    baseNodes.forEach((baseNode, idx) => {
        const propData = rawProps[idx];
        const processed = StackProcessor.process(baseNode, propData.modifiers);
        manifestProps.push(...processed);
    });

    const worldTransform = {
      x: cx - camX * zoom,
      y: cy - camY * zoom,
      scaleX: zoom,
      scaleY: zoom
    };

    return G.group('scene_root', null, [
      heavens,
      G.group('world_anchor', worldTransform, [
          ...environmentNodes,
          ...manifestProps
      ])
    ]);
  }
}
