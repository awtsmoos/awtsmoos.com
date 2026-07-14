// B"H
// Boruch Hashem
// Blessed is He
/** @module ObjectEnvelope @description Wraps every published thing in one truthful identity. */
import { stableObjectId } from './stableObjectId.mjs';

/** Creates a normalized creator-world object envelope. */
export function createObjectEnvelope(input) {
	const type = requiredText(input?.type, 'type');
	const owner = requiredText(input?.owner, 'owner');
	const seed = requiredText(input?.seed || input?.id || input?.title, 'seed');
	const createdAt = String(input?.createdAt || new Date().toISOString());
	return {
		id: input?.id || stableObjectId(type, owner, seed),
		type,
		schemaVersion: positiveInteger(input?.schemaVersion || 1, 'schemaVersion'),
		owner,
		visibility: input?.visibility || 'private',
		createdAt,
		updatedAt: String(input?.updatedAt || createdAt),
		payload: structuredCloneSafe(input?.payload || {}),
		metadata: structuredCloneSafe(input?.metadata || {})
	};
}

function requiredText(value, name) {
	const text = String(value || '').trim();
	if (!text) {
		throw new TypeError(`Object envelope ${name} is required.`);
	}
	return text;
}

function positiveInteger(value, name) {
	const number = Number(value);
	if (!Number.isInteger(number) || number < 1) {
		throw new TypeError(`${name} must be a positive integer.`);
	}
	return number;
}

function structuredCloneSafe(value) {
	return typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
}
