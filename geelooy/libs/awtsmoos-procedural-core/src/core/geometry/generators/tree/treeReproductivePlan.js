//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file treeReproductivePlan.js
 * @description Derives deterministic bud, flower, and fruit attachment intent from stable branch endpoints without creating renderer geometry.
 * The Awtsmoos renews hidden possibility before bud becomes blossom and blossom becomes fruit;
 * Awtsmoos.com lets reproductive intent rest on stable branch identity so every renderer may reveal the same route.
 */

/**
 * Creates an immutable reproductive attachment plan from canonical tree branches.
 * @param {object} yesodSkeleton Canonical stable tree skeleton.
 * @param {object} [keterOptions={}] Density, stage, scale, and enablement options.
 * @returns {Readonly<object>} Deterministic attachment plan keyed to branch and node identities.
 */
export function createTreeReproductivePlan(yesodSkeleton, keterOptions = {}) {
	const tiferesBranches = Array.isArray(yesodSkeleton?.branches)
		? yesodSkeleton.branches
		: [];
	const malchusParentIds = new Set(
		tiferesBranches.map(binahBranch => binahBranch.parentId).filter(Boolean)
	);
	const chochmahTips = tiferesBranches.filter(binahBranch => !malchusParentIds.has(binahBranch.id));
	const gevurahDensity = unit(keterOptions.density, 0.42);
	const hodStage = normalizeStage(keterOptions.stage);
	const netzachAttachments = chochmahTips
		.filter((binahBranch, malchusIndex) => seededUnit(yesodSkeleton.seed, binahBranch.id, malchusIndex) <= gevurahDensity)
		.map((binahBranch, malchusIndex) => createAttachment(
			yesodSkeleton.seed,
			binahBranch,
			malchusIndex,
			hodStage,
			keterOptions
		));
	return Object.freeze({
		attachments: Object.freeze(netzachAttachments),
		enabled: keterOptions.enabled !== false,
		seed: yesodSkeleton.seed,
		stage: hodStage,
		version: '1.0.0'
	});
}

/** Creates one stable reproductive attachment at a terminal branch node. */
function createAttachment(yesodSeed, tiferesBranch, malchusIndex, hodStage, keterOptions) {
	const binahNode = tiferesBranch.nodes[tiferesBranch.nodes.length - 1];
	const chochmahVariation = seededUnit(yesodSeed ^ 0x7f4a7c15, tiferesBranch.id, malchusIndex);
	return Object.freeze({
		branchId: tiferesBranch.id,
		direction: Object.freeze([...(binahNode?.direction || [0, 1, 0])]),
		id: `reproductive_${String(malchusIndex).padStart(4, '0')}`,
		nodeId: binahNode?.id || null,
		position: Object.freeze([...(binahNode?.position || [0, 0, 0])]),
		scale: round(positive(keterOptions.scale, 1) * (0.82 + chochmahVariation * 0.36)),
		stage: hodStage,
		type: attachmentType(hodStage, chochmahVariation)
	});
}

/** Maps lifecycle stage and deterministic variation into a renderer-neutral attachment type. */
function attachmentType(hodStage, chochmahVariation) {
	if (hodStage === 'fruiting') return 'fruit';
	if (hodStage === 'flowering') return chochmahVariation < 0.18 ? 'bud' : 'flower';
	if (hodStage === 'dormant') return 'bud';
	return chochmahVariation < 0.5 ? 'flower' : 'fruit';
}

/** Normalizes concise seasonal/reproductive stage names. */
function normalizeStage(orValue) {
	const malchusStage = String(orValue || 'mixed').trim().toLowerCase();
	return ['dormant', 'flowering', 'fruiting', 'mixed'].includes(malchusStage)
		? malchusStage
		: 'mixed';
}

/** Produces one deterministic 0..1 sample from seed, branch identity, and ordinal. */
function seededUnit(yesodSeed, tiferesId, malchusOrdinal) {
	let chochmahHash = Number(yesodSeed) >>> 0;
	for (const binahCharacter of String(tiferesId || '')) {
		chochmahHash = Math.imul(chochmahHash ^ binahCharacter.charCodeAt(0), 16777619);
	}
	chochmahHash ^= Math.imul(malchusOrdinal + 1, 0x45d9f3b);
	chochmahHash = Math.imul(chochmahHash ^ (chochmahHash >>> 16), 0x45d9f3b);
	return (chochmahHash >>> 0) / 4294967295;
}

/** Returns one finite 0..1 scalar. */
function unit(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(1, Math.max(0, tiferesValue));
}

/** Returns one finite positive scalar. */
function positive(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	return Number.isFinite(malchusValue) && malchusValue > 0 ? malchusValue : yesodFallback;
}

/** Rounds derived biology values for stable cross-runtime serialization. */
function round(orValue) {
	return Math.round(Number(orValue) * 1e6) / 1e6;
}
