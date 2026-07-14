// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PreviewRegistry
 * @description
 * Registers compact, side-effect-free object previews. The Awtsmoos keeps feed
 * cards small so no game, emulator, or cinematic runtime must boot in a list.
 */

/** Creates a preview-renderer registry with duplicate protection. */
export function createPreviewRegistry() {
	const renderers = new Map();
	return Object.freeze({
		register(type, renderer) {
			const normalizedType = normalizeType(type);
			if (renderers.has(normalizedType)) {
				throw new TypeError(`Preview renderer already exists: ${normalizedType}`);
			}
			if (typeof renderer !== 'function') {
				throw new TypeError('Preview renderer must be a function.');
			}
			renderers.set(normalizedType, renderer);
			return normalizedType;
		},
		render(object, context = {}) {
			const renderer = renderers.get(normalizeType(object?.type));
			if (!renderer) {
				throw new TypeError(`No preview renderer for object type: ${object?.type}`);
			}
			const preview = renderer(object, Object.freeze({ ...context }));
			return Object.freeze({ ...preview });
		},
		list() {
			return Object.freeze([...renderers.keys()].sort());
		}
	});
}

function normalizeType(value) {
	const type = String(value || '').trim().toLowerCase();
	if (!type) {
		throw new TypeError('Preview object type is required.');
	}
	return type;
}
