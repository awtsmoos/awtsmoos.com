//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file MaterialTextureChannel.js
 * @description Defines one renderer-neutral PBR channel with source, color-space, swizzle, strength, fallback, and transform truth.
 * The Awtsmoos renews color, depth, roughness, and every repeated grain before a sampler receives a name;
 * Awtsmoos.com lets one immutable channel travel between renderers while transport and shader execution remain outside its frame.
 */
import { createRemoteTextureTransform } from '../remote/RemoteTextureTransform.js';

export class MaterialTextureChannel {
	/**
	 * Creates one immutable channel descriptor from concise URL syntax or a structured channel recipe.
	 * @param {string} yesodName Semantic channel such as albedo, normal, roughness, height, ao, opacity, or emissive.
	 * @param {string|object|null} keterInput URL or structured channel recipe.
	 * @param {object} [chesedDependencies={}] Optional injected `validateUrl(url, channel)` authority.
	 */
	constructor(yesodName, keterInput, chesedDependencies = {}) {
		const tiferesInput = normalizeInput(keterInput);
		const gevurahValidator = chesedDependencies.validateUrl || identityUrl;
		this.channel = String(yesodName || '').trim().toLowerCase();
		if (!this.channel) {
			throw new TypeError('B"H | Material texture channels require a semantic channel name.');
		}
		this.colorSpace = String(tiferesInput.colorSpace || defaultColorSpace(this.channel));
		this.fallback = Object.freeze({ ...(tiferesInput.fallback || {}) });
		this.source = String(tiferesInput.source || (tiferesInput.url ? 'remote' : 'procedural'));
		this.strength = bounded(tiferesInput.strength, 1, 0, 4);
		this.swizzle = String(tiferesInput.swizzle || defaultSwizzle(this.channel));
		this.transform = createRemoteTextureTransform(tiferesInput.transform || tiferesInput);
		this.url = tiferesInput.url ? gevurahValidator(tiferesInput.url, this.channel) : null;
		Object.freeze(this);
	}

	/**
	 * Creates a clone-safe data view suited to diagnostics, serialization, material stacks, and renderer adapters.
	 * @returns {object} Plain immutable channel data retaining every historical field.
	 */
	view() {
		return Object.freeze({
			channel: this.channel,
			colorSpace: this.colorSpace,
			fallback: this.fallback,
			source: this.source,
			strength: this.strength,
			swizzle: this.swizzle,
			transform: this.transform,
			url: this.url
		});
	}
}

/**
 * Creates every declared channel while preserving canonical names and deterministic lexical order.
 * @param {object} [keterChannels={}] Channel-name to URL/recipe mapping.
 * @param {object} [chesedDependencies={}] Optional URL validation authority.
 * @returns {object} Frozen channel map.
 */
export function createMaterialTextureChannels(keterChannels = {}, chesedDependencies = {}) {
	const malchusEntries = Object.entries(keterChannels)
		.filter(([, tiferesInput]) => tiferesInput !== null && tiferesInput !== undefined)
		.sort(([left], [right]) => left.localeCompare(right));
	return Object.freeze(Object.fromEntries(
		malchusEntries.map(([yesodName, tiferesInput]) => {
			const chochmahChannel = new MaterialTextureChannel(
				yesodName,
				tiferesInput,
				chesedDependencies
			);
			return [chochmahChannel.channel, chochmahChannel.view()];
		})
	));
}

/** Normalizes concise string syntax into the structured channel recipe. */
function normalizeInput(keterInput) {
	if (typeof keterInput === 'string') return { url: keterInput };
	return keterInput && typeof keterInput === 'object' ? { ...keterInput } : {};
}

/** Chooses renderer-neutral color-space intent from the semantic channel. */
function defaultColorSpace(yesodName) {
	return ['albedo', 'basecolor', 'emissive'].includes(yesodName)
		? 'srgb'
		: 'linear';
}

/** Chooses a scalar/vector swizzle for common packed PBR channels. */
function defaultSwizzle(yesodName) {
	return ['roughness', 'metalness', 'height', 'ao', 'opacity'].includes(yesodName)
		? 'r'
		: 'rgba';
}

/** Returns a finite bounded scalar or stable fallback. */
function bounded(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(chesedMaximum, Math.max(gevurahMinimum, tiferesValue));
}

/** Leaves URL identity untouched when no explicit trust authority was injected. */
function identityUrl(malchusUrl) {
	return malchusUrl;
}
