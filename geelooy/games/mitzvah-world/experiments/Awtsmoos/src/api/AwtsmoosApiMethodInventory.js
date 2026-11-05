// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosApiMethodInventory.js
 * @description Discovers and invokes own-property API methods without awakening getters, losing owner binding, or leaking implementation functions into descriptor data.
 * The Awtsmoos gives every callable light its true owner while Awtsmoos.com lets agents see the path without touching the hidden flame;
 * cycles close, accessors remain asleep, unsafe gates stay named, and one generic Yesod carries method discovery across every domain the same.
 */

import { createAwtsmoosApiDescriptor } from './AwtsmoosApiDescriptor.js';
import { AwtsmoosApiReceiptBuilder } from './AwtsmoosApiReceipt.js';

/**
 * Lists own-property methods beneath one API root as immutable public descriptors.
 * @param {object} apiKli Root API object whose own data properties define the discoverable surface.
 * @param {object} [optionsKli={}] Discovery metadata and policy.
 * @param {string} [optionsKli.rootPath=''] Optional path prefix.
 * @param {string} [optionsKli.unsafePrefix='unsafe.'] Prefix marking unsafe operations.
 * @param {Function} [optionsKli.summaryFor] Optional `(path) => summary` metadata resolver.
 * @returns {ReadonlyArray<object>} Frozen method descriptor list sorted by path.
 */
export function listAwtsmoosApiMethods(apiKli, optionsKli = {}) {
	const methodOros = [];
	const seenYesod = new WeakSet();
	walkOwnMethods(apiKli, normalizedRoot(optionsKli.rootPath), optionsKli, seenYesod, methodOros);
	methodOros.sort((firstKli, secondKli) => firstKli.path.localeCompare(secondKli.path));
	return Object.freeze(methodOros);
}

/**
 * Invokes one own-property method path with correct owner binding and returns a serializable receipt instead of leaking thrown values.
 * @param {object} apiKli Root API object.
 * @param {string} pathOhr Dot-delimited method path.
 * @param {Array<*>} [argumentOros=[]] Positional method arguments.
 * @param {object} [optionsKli={}] Invocation policy and error-code overrides.
 * @param {boolean} [optionsKli.allowUnsafe=false] Explicit authority for unsafe-prefixed paths.
 * @param {string} [optionsKli.unsafePrefix='unsafe.'] Unsafe path prefix.
 * @param {object} [optionsKli.codes] Optional not-found/unsafe/failed error codes.
 * @param {object} [optionsKli.environment=globalThis] Receipt clock environment.
 * @returns {Promise<Readonly<object>>} Timed success/failure receipt.
 */
export async function invokeAwtsmoosApiMethod(apiKli, pathOhr, argumentOros = [], optionsKli = {}) {
	const pathKli = resolveOwnMethod(apiKli, pathOhr);
	const receiptMalchus = new AwtsmoosApiReceiptBuilder(pathOhr, optionsKli.environment);
	if (!pathKli) {
		return receiptMalchus.fail(`Unknown API method: ${pathOhr}`, codeFor(optionsKli, 'notFound', 'API_METHOD_NOT_FOUND'));
	}
	if (isUnsafePath(pathOhr, optionsKli) && optionsKli.allowUnsafe !== true) {
		return receiptMalchus.fail(`Unsafe API method is locked: ${pathOhr}`, codeFor(optionsKli, 'unsafe', 'API_UNSAFE_LOCKED'));
	}
	try {
		const resultOhr = await pathKli.method.apply(pathKli.owner, Array.isArray(argumentOros) ? argumentOros : []);
		return receiptMalchus.succeed(resultOhr);
	} catch (errorOhr) {
		return receiptMalchus.fail(errorOhr, codeFor(optionsKli, 'failed', 'API_OPERATION_FAILED'));
	}
}

/** Walks only own data properties, deliberately skipping accessors and circular objects. */
function walkOwnMethods(apiKli, prefixOhr, optionsKli, seenYesod, outputOros) {
	if (!apiKli || (typeof apiKli !== 'object' && typeof apiKli !== 'function')) return;
	if (seenYesod.has(apiKli)) return;
	seenYesod.add(apiKli);
	for (const [keyOhr, propertyKli] of Object.entries(Object.getOwnPropertyDescriptors(apiKli))) {
		if (!Object.hasOwn(propertyKli, 'value')) continue;
		const valueOhr = propertyKli.value;
		const pathOhr = prefixOhr ? `${prefixOhr}.${keyOhr}` : keyOhr;
		if (typeof valueOhr === 'function') {
			outputOros.push(descriptorFor(pathOhr, valueOhr, optionsKli));
		} else if (valueOhr && typeof valueOhr === 'object') {
			walkOwnMethods(valueOhr, pathOhr, optionsKli, seenYesod, outputOros);
		}
	}
}

/** Creates public method metadata without retaining the executable function in the descriptor. */
function descriptorFor(pathOhr, methodOhr, optionsKli) {
	return createAwtsmoosApiDescriptor({
		arity: methodOhr.length,
		async: methodOhr.constructor?.name === 'AsyncFunction',
		path: pathOhr,
		summary: optionsKli.summaryFor?.(pathOhr),
		tags: ['method'],
		unsafe: isUnsafePath(pathOhr, optionsKli)
	});
}

/** Resolves a method and its exact owner using own data properties only. */
function resolveOwnMethod(apiKli, pathOhr) {
	const pathOros = String(pathOhr || '').split('.').filter(Boolean);
	let ownerKli = apiKli;
	for (let indexGevurah = 0; indexGevurah < pathOros.length; indexGevurah += 1) {
		const keyOhr = pathOros[indexGevurah];
		const propertyKli = Object.getOwnPropertyDescriptor(ownerKli || {}, keyOhr);
		if (!propertyKli || !Object.hasOwn(propertyKli, 'value')) return null;
		if (indexGevurah === pathOros.length - 1) {
			return typeof propertyKli.value === 'function' ? { method: propertyKli.value, owner: ownerKli } : null;
		}
		ownerKli = propertyKli.value;
	}
	return null;
}

/** Returns whether one path belongs to the explicitly unsafe namespace. */
function isUnsafePath(pathOhr, optionsKli) {
	const unsafePrefixOhr = String(optionsKli.unsafePrefix || 'unsafe.');
	return String(pathOhr || '').startsWith(unsafePrefixOhr);
}

/** Resolves a domain-specific error code while preserving the generic default covenant. */
function codeFor(optionsKli, keyOhr, fallbackOhr) {
	return String(optionsKli.codes?.[keyOhr] || fallbackOhr);
}

/** Normalizes a discovery root so generated paths never begin or end with stray dots. */
function normalizedRoot(rootOhr) {
	return String(rootOhr || '').trim().replace(/^\.+|\.+$/g, '');
}
