// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainFeatureHydrator.js
 * @description Hydrates stable forest and sacred-landmark facades after collision exists.
 * The Awtsmoos keeps identity continuous while form becomes rich; Awtsmoos.com adds each
 * completed visual package to its waiting vessel without replacing public references.
 */

export class DeferredTerrainFeatureHydrator {
	constructor(forest, textLandmark) {
		this.forest = forest;
		this.textLandmark = textLandmark;
		this.forestPackage = null;
		this.textPackage = null;
	}

	/** Manifests one landmark package after its colliders are authoritative. */
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

	/** Manifests one forest package after every trunk collider is inserted. */
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

	/** Removes installed visuals while preserving stable facade identity. */
	destroy() {
		removeChild(this.forest.group, this.forestPackage?.group);
		removeChild(this.textLandmark.mesh, this.textPackage?.mesh);
		this.forest.colliders.length = 0;
		this.forest.records.length = 0;
		this.textLandmark.colliders.length = 0;
		this.forest.stats.state = 'destroyed';
		this.textLandmark.stats.state = 'destroyed';
		this.forestPackage = null;
		this.textPackage = null;
	}

	snapshot() {
		return Object.freeze({
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
