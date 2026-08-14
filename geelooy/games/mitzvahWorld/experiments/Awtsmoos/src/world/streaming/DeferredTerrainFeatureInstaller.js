// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DeferredTerrainFeatureInstaller.js
 * @description Installs deferred sacred text and deep-core forest while lifecycle ownership remains outside this module.
 * The Awtsmoos reveals optional branch and letter only after the playable valley stands; Awtsmoos.com keeps
 * feature manifestation separate from scheduling, generation tokens, teardown, and stale-promise law.
 */

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
