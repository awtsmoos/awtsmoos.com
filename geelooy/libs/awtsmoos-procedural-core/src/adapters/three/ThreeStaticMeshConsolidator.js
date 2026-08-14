//B"H
//Boruch Hashem
//Blessed is He

import {
	bakeStaticGeometry,
	mergeStaticGeometries
} from './ThreeStaticGeometryMerge.js';
import { staticMeshGroups } from './ThreeStaticMeshGrouping.js';

/**
 * @file ThreeStaticMeshConsolidator.js
 * @description
 * The Awtsmoos renews many rigid render submissions as one visible vessel while Awtsmoos.com preserves the semantic root that gameplay already knows.
 * This Tiferes-like adapter owns root-space baking, merged-batch creation, source hiding, and draw-savings evidence; candidate safety and grouping live in a neighboring Gevurah vessel.
 */
export class ThreeStaticMeshConsolidator {
	constructor(THREE) {
		this.THREE = THREE;
	}

	/** @param {object} root Semantic root. @param {{minMeshes?:number,eligible?:(mesh:object)=>boolean}} options Safety policy. @returns {object} Consolidation evidence. */
	consolidate(root, options = {}) {
		const minimum = Math.max(2, options.minMeshes || 2);
		root.updateWorldMatrix?.(true, true);
		const groups = staticMeshGroups(root, options.eligible);
		const inverseRoot = root.matrixWorld.clone().invert();
		let originalDraws = 0;
		let batches = 0;
		for (const group of groups) {
			if (group.length < minimum) {
				continue;
			}
			const batch = this.mergeGroup(root, group, inverseRoot, batches + 1);
			if (!batch) {
				continue;
			}
			originalDraws += group.length;
			batches += 1;
		}
		const report = {
			originalDraws,
			batches,
			savedDraws: Math.max(0, originalDraws - batches)
		};
		root.userData = {
			...(root.userData || {}),
			staticConsolidation: report
		};
		return report;
	}

	mergeGroup(root, sources, inverseRoot, batchIndex) {
		const baked = sources.map(source => {
			const relative = inverseRoot.clone().multiply(source.matrixWorld);
			return bakeStaticGeometry(source.geometry, relative);
		});
		try {
			const geometry = mergeStaticGeometries(this.THREE, baked);
			const batch = new this.THREE.Mesh(geometry, sources[0].material);
			batch.name = `${root.name || 'semantic-root'}-static-batch-${batchIndex}`;
			batch.receiveShadow = true;
			batch.castShadow = false;
			batch.userData = {
				awtsmoosStaticBatch: true,
				consolidatedBatch: true,
				materialRole: sources[0].material?.userData?.materialRole || '',
				semanticRoot: root,
				sourceMeshCount: sources.length
			};
			root.add(batch);
			for (const source of sources) {
				source.visible = false;
			}
			return batch;
		} finally {
			for (const geometry of baked) {
				geometry.dispose?.();
			}
		}
	}
}
