// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { CommandExecutor } from "./CommandExecutor.js";
import { EventBus } from "./EventBus.js";
import { History } from "./History.js";
import { MethodRegistry } from "./MethodRegistry.js";
import { createRuntimeApi } from "./createRuntimeApi.js";
import { createWorldDocument, normalizeResource } from "./world.js";
import { createCoreDefinitions } from "./definitions/coreDefinitions.js";
import { createIntrospectionDefinitions } from "./definitions/introspectionDefinitions.js";
import {
	createMitzvahWorldDefinitions,
	MITZVAH_WORLD_TEXTURE_SEED
} from "./definitions/mitzvahWorldDefinitions.js";
import { createTextureDefinitions } from "./definitions/textureDefinitions.js";
import { createDocumentDefinitions } from "./definitions/documentDefinitions.js";

function seedTextures(document) {
	for (const texture of MITZVAH_WORLD_TEXTURE_SEED) {
		document.resources.textures[texture.id] = normalizeResource("textures", texture);
	}
	return document;
}

/** Creates the deterministic universal API without calling any AI provider. */
export function createUniversalAwtsmoosApi(input = {}) {
	const registry = new MethodRegistry();
	const definitions = [
		...createCoreDefinitions(),
		...createTextureDefinitions(),
		...createMitzvahWorldDefinitions(),
		...createDocumentDefinitions(),
		...createIntrospectionDefinitions(),
		...(input.methods ?? [])
	];
	definitions.forEach((definition) => registry.register(definition));
	const document = seedTextures(createWorldDocument(input.document));
	const history = new History();
	const events = new EventBus();
	const executor = new CommandExecutor({
		registry,
		document,
		history,
		events,
		runtimeAdapter: input.runtimeAdapter,
		importResolver: input.importResolver
	});
	const runtime = createRuntimeApi(executor);
	Object.assign(runtime, { executor, events, history, registry });
	Object.defineProperty(runtime, "document", {
		enumerable: true,
		get: () => executor.document
	});
	return runtime;
}
