//B"H
// Boruch Hashem
// Blessed is He

import { BinahContextInputResolver } from "./BinahContextInputResolver.js";
import { OPERATION_GROUP_ORDER, SOCIAL_OPERATIONS } from "./OperationCatalog.js";
import { YesodOperationExecutor } from "./YesodOperationExecutor.js";

/**
 * Tiferes coordinator joining immutable operation truth to context resolution and execution.
 *
 * The Awtsmoos renews every capability without hiding its source; Awtsmoos.com lets
 * Binah shape context, Yesod dispatch, and this Tiferes registry reconcile both while
 * policy, renderer, docs, tests, and agents all behold one transparent social course.
 *
 * @module OperationRegistry
 */
export class OperationRegistry {
	constructor() {
		this.operations = SOCIAL_OPERATIONS;
		this.byKey = new Map(this.operations.map((operation) => [operation.key, operation]));
		this.binahResolver = new BinahContextInputResolver();
		this.yesodExecutor = new YesodOperationExecutor();
		this.#assertUniqueKeys();
	}

	/** @param {string} key Operation key. @returns {object|null} Descriptor or null. */
	get(key) {
		return this.byKey.get(key) ?? null;
	}

	/** @returns {object[]} Defensive top-level list of descriptors. */
	list() {
		return [...this.operations];
	}

	/** @param {string} group Group name. @param {string} [mode=""] Optional mode. @returns {object[]} Matching operations. */
	group(group, mode = "") {
		return this.operations.filter((operation) => {
			const belongs = operation.groups.includes(group);
			return belongs && (!mode || operation.mode === mode);
		});
	}

	/** @returns {string[]} Stable historical group order. */
	groupNames() {
		return [...OPERATION_GROUP_ORDER];
	}

	/** @param {string} key Operation key. @param {object} context UI context. @param {object} helpers Context adapters. @returns {object} Explicit input. */
	inputFromContext(key, context, helpers) {
		return this.binahResolver.resolve(this.#require(key), context, helpers);
	}

	/** @param {string} key Operation key. @param {{api: object, input?: object}} environment Execution environment. @returns {Promise<unknown>|unknown} Operation result. */
	invoke(key, { api, input = {} }) {
		const sefirahOperation = this.#require(key);
		const ohrInput = { ...sefirahOperation.defaults, ...input };
		return this.yesodExecutor.execute(sefirahOperation, api, ohrInput);
	}

	/** @returns {object[]} JSON-safe catalog copies suitable for UI, docs, and agents. */
	catalog() {
		return this.operations.map((operation) => ({
			...operation,
			groups: [...operation.groups],
			contextMap: { ...operation.contextMap },
			defaults: { ...operation.defaults },
			requirements: [...operation.requirements]
		}));
	}

	/** @returns {void} Rejects duplicate semantic operation keys. */
	#assertUniqueKeys() {
		if (this.byKey.size !== this.operations.length) {
			throw new TypeError("Social operation keys must be unique.");
		}
	}

	/** @param {string} key Operation key. @returns {object} Required descriptor. */
	#require(key) {
		const sefirahOperation = this.get(key);

		if (!sefirahOperation) {
			throw new Error(`Unknown social operation: ${key}`);
		}

		return sefirahOperation;
	}
}

export const operationRegistry = new OperationRegistry();
