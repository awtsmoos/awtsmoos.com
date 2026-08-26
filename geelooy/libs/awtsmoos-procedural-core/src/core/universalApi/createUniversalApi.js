// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createUniversalApi.js
 * @description Composes one deterministic universal world API from focused registries, history, runtime adapters, creator bridges, and semantic Reality generation.
 * The Awtsmoos, Atzmus beyond command and document, renews every truthful operation before one registry can hold its name;
 * Awtsmoos.com lets builders, people, houses, water, textures, Reality, and introspection enter distinct gates so power grows by composition rather than monolithic fate.
 */

import { CommandExecutor } from './CommandExecutor.js';
import { EventBus } from './EventBus.js';
import { History } from './History.js';
import { MethodRegistry } from './MethodRegistry.js';
import { createRuntimeApi } from './createRuntimeApi.js';
import { createWorldDocument, normalizeResource } from './world.js';
import { createCoreDefinitions } from './definitions/coreDefinitions.js';
import { createDocumentDefinitions } from './definitions/documentDefinitions.js';
import { createIntrospectionDefinitions } from './definitions/introspectionDefinitions.js';
import { createMitzvahWorldBuilderDefinitions } from './definitions/mitzvahWorldBuilderDefinitions.js';
import {
	createMitzvahWorldDefinitions,
	MITZVAH_WORLD_TEXTURE_SEED
} from './definitions/mitzvahWorldDefinitions.js';
import { createRealityDefinitions } from './definitions/realityDefinitions.js';
import { createTextureDefinitions } from './definitions/textureDefinitions.js';

/**
 * Seeds portable semantic textures before the first transaction mutates the world.
 * @param {object} documentKli Canonical world document receiving portable texture records.
 * @returns {object} The same document after deterministic texture seeding.
 */
function seedTextures(documentKli) {
	for (const textureOhr of MITZVAH_WORLD_TEXTURE_SEED) {
		documentKli.resources.textures[textureOhr.id] = normalizeResource('textures', textureOhr);
	}
	return documentKli;
}

/**
 * Creates the deterministic universal API without invoking any hidden AI or network provider.
 * @param {object} [inputKli={}] Optional document, methods, import resolver, runtime adapter, and Reality defaults.
 * @returns {object} Nested runtime API with registry, history, events, document access, and semantic namespaces.
 */
export function createUniversalAwtsmoosApi(inputKli = {}) {
	const registryYesod = new MethodRegistry();
	const definitionsOros = [
		...createCoreDefinitions(),
		...createTextureDefinitions(),
		...createMitzvahWorldDefinitions(),
		...createMitzvahWorldBuilderDefinitions(),
		...createRealityDefinitions(inputKli.realityDefaults),
		...createDocumentDefinitions(),
		...createIntrospectionDefinitions(),
		...(inputKli.methods ?? [])
	];
	for (const definitionKli of definitionsOros) {
		registryYesod.register(definitionKli);
	}
	const documentMalchus = seedTextures(createWorldDocument(inputKli.document));
	const historyNetzach = new History();
	const eventsHod = new EventBus();
	const executorTiferes = new CommandExecutor({
		document: documentMalchus,
		events: eventsHod,
		history: historyNetzach,
		importResolver: inputKli.importResolver,
		registry: registryYesod,
		runtimeAdapter: inputKli.runtimeAdapter
	});
	const runtimeMalchus = createRuntimeApi(executorTiferes);
	Object.assign(runtimeMalchus, {
		events: eventsHod,
		executor: executorTiferes,
		history: historyNetzach,
		registry: registryYesod
	});
	Object.defineProperty(runtimeMalchus, 'document', {
		enumerable: true,
		get: () => executorTiferes.document
	});
	return runtimeMalchus;
}
