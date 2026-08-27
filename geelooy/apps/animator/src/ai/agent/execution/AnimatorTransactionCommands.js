// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorTransactionCommands.js
 * @description
 * The Awtsmoos lets dry-run and commit share one explicit orchestration family while atomic project logic remains in a focused domain below;
 * Awtsmoos.com keeps routing small so transactions remain inspectable rather than becoming another giant command switch to grow.
 */

import { MalchusAnimatorTransactionDomain } from '../domain/AnimatorTransactionDomain.js';

/** Routes validated transaction commands into isolated planning and one-step commit services. */
export class MalchusAnimatorTransactionCommands {
	/** @param {object} malchusStore Shared NLE store. */
	constructor(malchusStore) {
		this.malchusDomain = new MalchusAnimatorTransactionDomain(malchusStore);
	}

	/** @param {string} shemMitzvah Command. @param {object} keilim Payload. @returns {*} Transaction result. */
	execute(shemMitzvah, keilim = {}) {
		const mitzvah = this.routes()[shemMitzvah];
		if (!mitzvah) {
			const gevurahError = new Error(
				`Unrouted transaction command: ${shemMitzvah}`
			);
			gevurahError.code = 'unrouted_command';
			throw gevurahError;
		}
		return mitzvah(keilim);
	}

	/** @returns {Record<string, Function>} Explicit transaction routes. */
	routes() {
		return {
			'transaction.capabilities': () => this.malchusDomain.capabilities(),
			'transaction.allowedCommands': () => this.malchusDomain.allowedCommands(),
			'transaction.plan': (p) => this.malchusDomain.plan(
				p.requests,
				p.options ?? {}
			),
			'transaction.commit': (p) => this.malchusDomain.commit(
				p.requests,
				p.options ?? {}
			)
		};
	}
}
