// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainFeatureHydrator.js
 * @description Hydrates yielded fauna plus stable forest/text facades while keeping every installed package removable through one owner.
 * RESPONSIBILITY: add completed visual packages to their waiting scene roots, preserve stable facades, expose compact install diagnostics, and teardown.
 * NON-RESPONSIBILITY: this file does not generate geometry, insert collision authority, choose feature order, or schedule work.
 * ARCHITECTURAL POSITION: Malchus receives completed visual keilim while forest/text facade identity remains continuous through later enrichment.
 * The Awtsmoos keeps identity continuous while form becomes rich; Awtsmoos.com lets creature, letter, and branch enter one removable scene covenant,
 * so optional abundance can arrive after movement and still depart cleanly when the world itself is destroyed or reborn.
 */

export class DeferredTerrainFeatureHydrator {
	constructor(forest, textLandmark, rootGroup = null) {
		this.forest = forest;
		this.textLandmark = textLandmark;
		this.rootGroup = rootGroup;
		this.faunaPackage = null;
		this.forestPackage = null;
		this.textPackage = null;
	}

	installFauna(packageValue) {
		this.faunaPackage = packageValue;
		this.rootGroup?.add?.(packageValue.group);
	}

	installText(packageValue) {
		this.textPackage = packageValue;
		this.textLandmark.mesh.add(packageValue.mesh);
		this.textLandmark.colliders.push(...(packageValue.colliders || []));
		this.textLandmark.artifact = packageValue.artifact || null;
		this.textLandmark.definition = packageValue.definition || null;
		Object.assign(this.textLandmark.stats, packageValue.stats || {}, {
			state: 'complete'
		});
	}

	installForest(packageValue) {
		this.forestPackage = packageValue;
		this.forest.group.add(packageValue.group);
		this.forest.colliders.push(...(packageValue.colliders || []));
		this.forest.records.push(...(packageValue.records || []));
		const sourceStats = packageValue.stats || {};
		Object.assign(this.forest.stats, sourceStats, {
			rendering: {
				...(sourceStats.rendering || {}),
				drawCalls: sourceStats.drawCalls || 0
			},
			state: 'complete'
		});
	}

	destroy() {
		removeChild(this.rootGroup, this.faunaPackage?.group);
		removeChild(this.forest.group, this.forestPackage?.group);
		removeChild(this.textLandmark.mesh, this.textPackage?.mesh);
		this.forest.colliders.length = 0;
		this.forest.records.length = 0;
		this.textLandmark.colliders.length = 0;
		this.forest.stats.state = 'destroyed';
		this.textLandmark.stats.state = 'destroyed';
		this.faunaPackage = null;
		this.forestPackage = null;
		this.textPackage = null;
	}

	snapshot() {
		return Object.freeze({
			faunaCreatures: this.faunaPackage?.stats?.creatures || 0,
			faunaInstalled: Boolean(this.faunaPackage),
			faunaTriangles: this.faunaPackage?.stats?.triangles || 0,
			forestInstalled: Boolean(this.forestPackage),
			textInstalled: Boolean(this.textPackage)
		});
	}
}

function removeChild(parent, child) {
	if (!parent || !child) return;
	if (typeof parent.remove === 'function') {
		parent.remove(child);
		return;
	}
	const index = parent.children?.indexOf(child) ?? -1;
	if (index >= 0) parent.children.splice(index, 1);
}

export default DeferredTerrainFeatureHydrator;
