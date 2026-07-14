// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CreatorWorldOs
 * @description
 * Assembles registries without coupling application runtimes. The Awtsmoos
 * lets posts, worlds, characters, replays, films, and artifact proof meet safely.
 */
import { createAdapterRegistry } from './adapterRegistry.mjs';
import { createObjectRegistry } from './objectRegistry.mjs';
import { createPreviewRegistry } from './previewRegistry.mjs';

/** Creates one isolated creator-world operating-system context. */
export function createCreatorWorldOs(input = {}) {
	const objects = createObjectRegistry();
	const previews = createPreviewRegistry();
	const adapters = createAdapterRegistry();
	for (const definition of input.objectTypes || []) {
		objects.register(definition);
		if (definition.createPreview) {
			previews.register(definition.type, definition.createPreview);
		}
	}
	for (const adapter of input.adapters || []) {
		adapters.register(adapter);
	}
	return Object.freeze({
		version: String(input.version || '1.0.0'),
		objects,
		previews,
		adapters,
		inspect() {
			return Object.freeze({
				version: String(input.version || '1.0.0'),
				objectTypes: objects.list().map(item => item.type),
				previewTypes: previews.list(),
				adapterIds: adapters.list().map(item => item.id)
			});
		}
	});
}
