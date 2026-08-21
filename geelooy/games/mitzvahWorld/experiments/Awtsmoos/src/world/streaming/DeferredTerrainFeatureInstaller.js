// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainFeatureInstaller.js
 * @description Installs yielded fauna, sacred text, and deep forest while lifecycle ownership remains in DeferredTerrainEnrichment.
 * RESPONSIBILITY: load one optional feature, build its package, verify generation currency, then hand manifestation to the hydrator/ledger authorities.
 * NON-RESPONSIBILITY: this file does not schedule enrichment start, own cancellation tokens, or retain installed package identity.
 * ARCHITECTURAL POSITION: Malchus receives each optional garment only after the lifecycle proves its generation is still current and fit.
 * The Awtsmoos reveals creature, letter, and branch only after the playable valley stands; Awtsmoos.com keeps each installation focused,
 * so yielded life and later forests can deepen the world without smuggling another scheduler or hidden ownership knot.
 */

export async function installDeferredFaunaFeature(owner, generation) {
	if (!owner.isCurrent(generation)) return;
	owner.state = 'fauna-loading';
	const module = await owner.loadFauna();
	if (!owner.isCurrent(generation)) return;
	const packageValue = await module.createDeferredVillageFaunaPackage({
		groundSampler: owner.context.groundSampler,
		quality: owner.context.quality,
		shouldContinue: () => owner.isCurrent(generation),
		yieldWork: owner.yieldWork
	});
	if (!owner.isCurrent(generation)) return;
	owner.hydrator.installFauna(packageValue);
}

export async function installDeferredTextFeature(owner, generation) {
	if (!owner.isCurrent(generation)) return;
	owner.state = 'text-loading';
	const module = await owner.loadText();
	if (!owner.isCurrent(generation)) return;
	const packageValue = await module.createProceduralTextLandmark(
		owner.context.groundSampler
	);
	if (!owner.isCurrent(generation)) return;
	const colliders = owner.ledger.insertAll(packageValue.colliders);
	owner.context.obstacleTriangles.push(...colliders);
	owner.obstacleAdditions.push(...colliders);
	owner.hydrator.installText(packageValue);
}

export async function installDeferredForestFeature(owner, generation) {
	if (!owner.isCurrent(generation)) return;
	owner.state = 'forest-loading';
	const module = await owner.loadForest();
	if (!owner.isCurrent(generation)) return;
	const packageValue = module.createProceduralForest({
		groundSampler: owner.context.groundSampler,
		halfSize: owner.context.halfSize,
		obstacleTriangles: owner.context.obstacleTriangles,
		quality: owner.context.quality
	});
	if (!owner.isCurrent(generation)) return;
	owner.ledger.insertAll(packageValue.colliders);
	owner.hydrator.installForest(packageValue);
}
