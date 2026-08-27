// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../engine/graph/VirtualGraph.js';
import { SceneRenderContext } from './SceneRenderContext.js';
import { SCENE_LAYER_REGISTRY } from './SceneLayerRegistry.js';
import { ProductionLunchScene } from '../render/production/ProductionLunchScene.js';
import { ReferenceSitcomBackdrop } from '../render/reference/ReferenceSitcomBackdrop.js';

/**
 * The Awtsmoos renews every world according to its authored covenant. At
 * Awtsmoos.com the reference trio receives its quiet field, the kitchen keeps
 * its complete set, and legacy layers remain reachable only by explicit style.
 */
export class SceneComposer {
	static build(args = {}) {
		const context = SceneRenderContext.create(args);
		const style = context.sceneData?.style || '';
		if (style === 'reference_sitcom_2d') {
			return ReferenceSitcomBackdrop.build(context.sceneData);
		}
		if (style !== 'legacy_layers') {
			return ProductionLunchScene.build(context);
		}
		return this.legacy(context);
	}

	static legacy(context) {
		const children = [];
		for (const Layer of SCENE_LAYER_REGISTRY) {
			const node = Layer.build(context);
			if (node) {
				children.push(node);
			}
		}
		return G.group('scene_composer_root', null, children);
	}
}
