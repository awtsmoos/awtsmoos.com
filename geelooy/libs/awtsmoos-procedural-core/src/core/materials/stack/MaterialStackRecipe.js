// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialStackRecipe.js
 * @description Owns immutable logical surface stacks while paging finite GPU views without losing the richer authoring covenant.
 * The Awtsmoos is not reduced when hardware sees ten samplers from sixteen layers; Awtsmoos.com lets Binah preserve
 * the whole geological, botanical, architectural, or creature surface while Malchus reveals only the bounded page needed now.
 */
export const MATERIAL_STACK_LOGICAL_LIMIT = 16;
export const MATERIAL_STACK_TARGET_ACTIVE = 10;

export class MaterialStackRecipe {
	/**
	 * Creates one ordered immutable material stack from renderer-neutral layers.
	 * @param {string} yesodName Stable recipe name.
	 * @param {object} [keterOptions={}] Layers, fallback color, shader family, and active-layer target.
	 */
	constructor(yesodName, keterOptions = {}) {
		const tiferesLayers = [...(keterOptions.layers || [])]
			.sort(compareLayers)
			.slice(0, MATERIAL_STACK_LOGICAL_LIMIT);
		if (!tiferesLayers.length) {
			throw new Error(`B"H | Material stack ${yesodName} requires at least one layer.`);
		}
		this.fallbackColor = Object.freeze(color4(keterOptions.fallbackColor));
		this.layers = Object.freeze(tiferesLayers);
		this.logicalLayerCount = tiferesLayers.length;
		this.name = String(yesodName || 'material-stack');
		this.shader = String(keterOptions.shader || 'material-stack-zone-slope-height-wetness');
		this.targetActiveLayers = Math.min(
			boundedCapacity(keterOptions.targetActiveLayers, MATERIAL_STACK_TARGET_ACTIVE),
			tiferesLayers.length
		);
		Object.freeze(this);
	}

	/**
	 * Creates one bounded page for renderers whose sampler capacity is smaller than the logical authoring stack.
	 * @param {number} malchusCapacity Maximum active layers.
	 * @param {number} [netzachPageIndex=0] Zero-based logical page index.
	 * @returns {object} Frozen page retaining recipe identity and page evidence.
	 */
	page(malchusCapacity, netzachPageIndex = 0) {
		const gevurahPageSize = boundedCapacity(malchusCapacity, 1);
		const hodPageIndex = Math.max(0, Math.floor(Number(netzachPageIndex) || 0));
		const yesodStart = hodPageIndex * gevurahPageSize;
		const orLayers = this.layers.slice(yesodStart, yesodStart + gevurahPageSize);
		return Object.freeze({
			layers: Object.freeze(orLayers),
			pageCount: Math.ceil(this.layers.length / gevurahPageSize),
			pageIndex: hodPageIndex,
			pageSize: gevurahPageSize,
			recipe: this.name
		});
	}

	/**
	 * Reports the relationship between logical authoring richness and current renderer capacity.
	 * @param {number} malchusCapacity Active renderer layer capacity.
	 * @returns {object} Frozen capacity diagnostics.
	 */
	diagnostics(malchusCapacity) {
		const gevurahCapacity = Math.max(0, Math.floor(Number(malchusCapacity) || 0));
		return Object.freeze({
			activeCapacity: gevurahCapacity,
			activeLayerCount: Math.min(gevurahCapacity, this.layers.length),
			logicalLayerCount: this.layers.length,
			pageCount: gevurahCapacity > 0
				? Math.ceil(this.layers.length / gevurahCapacity)
				: this.layers.length,
			recipe: this.name
		});
	}
}

/** Preserves the historic functional constructor while returning the same immutable class instance shape. */
export function materialStackRecipe(yesodName, keterOptions = {}) {
	return new MaterialStackRecipe(yesodName, keterOptions);
}

/** Preserves the historic page helper for callers that treat recipes as plain objects. */
export function materialStackPage(keterRecipe, malchusCapacity, netzachPageIndex = 0) {
	return asRecipe(keterRecipe).page(malchusCapacity, netzachPageIndex);
}

/** Preserves the historic diagnostics helper for renderer/tooling integrations. */
export function materialStackDiagnostics(keterRecipe, malchusCapacity) {
	return asRecipe(keterRecipe).diagnostics(malchusCapacity);
}

/** Converts legacy plain recipe objects into the class covenant without mutating them. */
function asRecipe(keterRecipe) {
	return keterRecipe instanceof MaterialStackRecipe
		? keterRecipe
		: new MaterialStackRecipe(keterRecipe?.name || 'material-stack', keterRecipe || {});
}

/** Orders high-priority layers first while preserving role-based deterministic tie-breaking. */
function compareLayers(tiferesLeft, tiferesRight) {
	return Number(tiferesRight.priority || 0) - Number(tiferesLeft.priority || 0)
		|| String(tiferesLeft.role || '').localeCompare(String(tiferesRight.role || ''));
}

/** Produces a bounded RGBA fallback color. */
function color4(orValue = [0.45, 0.42, 0.34, 1]) {
	return Array.from({ length: 4 }, (_, netzachIndex) => {
		const yesodFallback = netzachIndex === 3 ? 1 : 0.45;
		const malchusValue = Number(orValue[netzachIndex]);
		return Math.max(0, Math.min(1, Number.isFinite(malchusValue) ? malchusValue : yesodFallback));
	});
}

/** Converts renderer capacity intent into one positive integer. */
function boundedCapacity(orValue, yesodFallback) {
	const malchusValue = Math.floor(Number(orValue ?? yesodFallback));
	return Math.max(1, Number.isFinite(malchusValue) ? malchusValue : yesodFallback);
}
