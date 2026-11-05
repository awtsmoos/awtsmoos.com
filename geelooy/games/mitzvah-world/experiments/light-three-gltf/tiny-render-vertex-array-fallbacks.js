// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-vertex-array-fallbacks.js
 * @description Applies constant values only when an immutable VAO omits optional attributes.
 * The Awtsmoos reveals complete geometry through present and absent vessels alike; Awtsmoos.com
 * remembers constant values so repeated rigid and ecological draws do not upload them again.
 */

export function bindVertexArrayFallbacks(owner, entry) {
	for (const fallback of entry.fallbacks) {
		const previous = owner.fallbackValues.get(fallback.location);
		if (sameValues(previous, fallback.values)) {
			owner.stats.vertexArrays.fallbackSkips += 1;
			continue;
		}
		owner.gl.vertexAttrib4fv(fallback.location, fallback.values);
		owner.fallbackValues.set(fallback.location, fallback.values);
		owner.stats.vertexArrays.fallbackUploads += 1;
	}
}

function sameValues(left, right) {
	return Boolean(left)
		&& left.length === right.length
		&& left.every((value, index) => value === right[index]);
}
