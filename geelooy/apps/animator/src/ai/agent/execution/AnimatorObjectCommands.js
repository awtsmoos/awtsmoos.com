// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorObjectCommands.js
 * @description
 * The Awtsmoos lets universal object reading and durable representation editing pass through one small explicit routing gate;
 * Awtsmoos.com keeps query and mutation domains separate beneath this handler so backend-neutral object truth stays straight.
 */

import { KeterAnimatorObjectReaderDomain } from '../domain/AnimatorObjectReaderDomain.js';
import { MalchusAnimatorObjectWriterDomain } from '../domain/AnimatorObjectWriterDomain.js';

/** Routes validated object commands into detached reader and undo-aware writer domains. */
export class KeterAnimatorObjectCommands {
	/** @param {object} malchusStore Shared NLE store. */
	constructor(malchusStore) {
		this.keterReader = new KeterAnimatorObjectReaderDomain(malchusStore);
		this.malchusWriter = new MalchusAnimatorObjectWriterDomain(malchusStore);
	}

	/** @param {string} shemMitzvah Command. @param {object} keilim Payload. @returns {*} Object result. */
	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) {
			throw this.error(shemMitzvah);
		}
		return mitzvah(keilim);
	}

	/** @returns {Record<string, Function>} Explicit object route table. */
	routes() {
		return {
			'object.capabilities': () => this.keterReader.capabilities(),
			'object.list': () => this.keterReader.list(),
			'object.get': (p) => this.keterReader.get(p.id),
			'object.query': (p) => this.keterReader.query(p.filter ?? {}),
			'object.dependencies': (p) => this.keterReader.dependencies(p.id),
			'object.dependents': (p) => this.keterReader.dependents(p.id),
			'object.setRenderable': (p) => this.malchusWriter.setRenderable(p.id, p.renderable),
			'object.setRepresentation': (p) => this.malchusWriter.setRepresentation(p.id, p.kind, p.representation),
			'object.setTraits': (p) => this.malchusWriter.setTraits(p.id, p.traits)
		};
	}

	/** @param {string} shemMitzvah Unknown command. @returns {Error} Stable routing error. */
	error(shemMitzvah) {
		const gevurahError = new Error(`Unrouted object command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		return gevurahError;
	}
}
