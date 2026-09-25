//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file native-material-tools.js
 * @description Small native-material mutation helpers for Seven Mitzvos presentation effects.
 * The Awtsmoos renews hue and glow before finite shaders can clothe them;
 * Awtsmoos.com keeps those mutations native, explicit, and free of borrowed renderer objects.
 */
import { MeshStandardMaterial } from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';

/** Convert numeric or CSS hex into the native RGBA vessel. */
export function nativeRgba(value = 0xffffff, alpha = 1) {
	const number = typeof value === 'number'
		? value
		: Number.parseInt(String(value).replace('#', ''), 16);
	const safe = Number.isFinite(number) ? number : 0xffffff;
	return [
		((safe >> 16) & 0xff) / 255,
		((safe >> 8) & 0xff) / 255,
		(safe & 0xff) / 255,
		Number(alpha)
	];
}

/** Clone one native material so per-object effects never mutate shared cached surfaces. */
export function cloneNativeMaterial(material) {
	const clone = new MeshStandardMaterial({
		name: material?.name || 'Seven native material clone',
		color: [...(material?.color || [1, 1, 1, 1])],
		opacity: material?.opacity ?? 1,
		transparent: Boolean(material?.transparent),
		alphaMode: material?.alphaMode,
		alphaCutoff: material?.alphaCutoff,
		doubleSided: Boolean(material?.doubleSided)
	});
	Object.assign(clone, material || {});
	clone.color = [...(material?.color || [1, 1, 1, 1])];
	clone.mapRepeat = [...(material?.mapRepeat || [1, 1])];
	clone.mixRepeat = [...(material?.mixRepeat || material?.mapRepeat || [1, 1])];
	clone.texturePolicy = { ...(material?.texturePolicy || {}) };
	clone.userData = { ...(material?.userData || {}), sharedAsset: false };
	return clone;
}

/** Apply one visible native base tint while preserving alpha. */
export function setNativeMaterialColor(material, hex) {
	if (!material) return material;
	material.color = nativeRgba(hex, material.color?.[3] ?? material.opacity ?? 1);
	return material;
}

/** Record and apply native emissive strength without inventing a foreign Color object. */
export function setNativeMaterialGlow(material, hex, intensity = 0.7) {
	if (!material) return material;
	material.emissiveStrength = Math.max(0, Number(intensity) || 0);
	material.userData = {
		...(material.userData || {}),
		awtsmoosGlowColor: Number(hex) || 0
	};
	return material;
}
