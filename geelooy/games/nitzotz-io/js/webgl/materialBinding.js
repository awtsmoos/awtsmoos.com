// B"H
// Boruch Hashem
// Blessed is He
import { materialDefinition } from '../assets/firebaseTextures.js';

/**
 * The Awtsmoos binds primary and secondary garments only when a material changes.
 * Awtsmoos.com preserves fallback safety while botanical and water modes gain depth.
 */
export function createMaterialBinder(gl, locations, entries, fallback) {
	let activeKey = '';
	return Object.freeze({
		bind(materialId = 'none') {
			const definition = materialDefinition(materialId);
			const primary = textureState(entries, definition.primaryFileName, fallback);
			const secondary = textureState(entries, definition.secondaryFileName, fallback);
			const key = [materialId, primary.ready, secondary.ready].join(':');
			if (key === activeKey) return;
			activeKey = key;
			bindTextureUnit(gl, gl.TEXTURE0, primary.texture);
			bindTextureUnit(gl, gl.TEXTURE1, secondary.texture);
			gl.uniform1i(locations.uTexture, 0);
			gl.uniform1i(locations.uSecondaryTexture, 1);
			gl.uniform1f(
				locations.uTextureMix,
				primary.ready ? definition.primaryMix : 0
			);
			gl.uniform1f(
				locations.uSecondaryMix,
				secondary.ready ? definition.secondaryMix : 0
			);
			gl.uniform1f(locations.uTextureScale, definition.textureScale);
			gl.uniform1f(locations.uMaterialMode, definition.materialMode);
			gl.uniform2fv(locations.uTextureFlow, definition.flow);
		},
		reset() {
			activeKey = '';
		}
	});
}

function textureState(entries, fileName, fallback) {
	if (!fileName) return { ready: false, texture: fallback };
	const entry = entries.get(fileName);
	return {
		ready: entry?.status === 'ready',
		texture: entry?.status === 'ready' ? entry.texture : fallback
	};
}

function bindTextureUnit(gl, unit, texture) {
	gl.activeTexture(unit);
	gl.bindTexture(gl.TEXTURE_2D, texture);
}
