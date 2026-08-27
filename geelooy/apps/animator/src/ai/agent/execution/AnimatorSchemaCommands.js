// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorSchemaCommands.js
 * @description
 * The Awtsmoos lets schema discovery and durable vocabulary changes share one explicit route table without mingling their storage law;
 * Awtsmoos.com keeps the handler thin so catalog, project persistence, and command-tool generation remain separately inspectable draw.
 */

import { DaasAnimatorSchemaDomain } from '../domain/AnimatorSchemaDomain.js';

/** Routes validated schema commands into catalog discovery and durable project-definition operations. */
export class DaasAnimatorSchemaCommands {
	/** @param {object} malchusStore Shared store. @param {object} daasCommandRegistry Canonical command registry. */
	constructor(malchusStore, daasCommandRegistry) {
		this.daasDomain = new DaasAnimatorSchemaDomain(
			malchusStore,
			daasCommandRegistry
		);
	}

	/** @param {string} shemMitzvah Command. @param {object} keilim Payload. @returns {*} Schema result. */
	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) {
			const gevurahError = new Error(`Unrouted schema command: ${shemMitzvah}`);
			gevurahError.code = 'unrouted_command';
			throw gevurahError;
		}
		return mitzvah(keilim);
	}

	/** @returns {Record<string, Function>} Explicit schema routes. */
	routes() {
		return {
			'schema.list': () => this.daasDomain.list(),
			'schema.get': (p) => this.daasDomain.get(p.id),
			'schema.validate': (p) => this.daasDomain.validate(p.id, p.value),
			'schema.example': (p) => this.daasDomain.example(p.id),
			'schema.register': (p) => this.daasDomain.register(p.entry),
			'schema.unregister': (p) => this.daasDomain.unregister(p.id),
			'schema.toolDefinitions': () => this.daasDomain.toolDefinitions()
		};
	}
}
