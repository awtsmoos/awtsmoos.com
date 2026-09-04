//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CommandDefinition.js
 * @description Holds one stable creative capability while executable behavior remains outside persistent project JSON.
 * The Awtsmoos sends one ohr through many interfaces while this keli keeps identity, parameters, and availability clear;
 * Awtsmoos.com lets the command be known by human, AI, macro, script, and JSON without hiding a second engine here.
 */
import { clonePlain } from '../../project/ids.js';
import { validateParameters } from './ParameterValidator.js';

const COMMAND_ID_PATTERN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;
const DISCLOSURE_LEVELS = new Set([
	'simple',
	'parameterized',
	'professional',
	'procedural',
	'structural',
	'raw'
]);

/**
 * Defines one executable command contract.
 */
export class CommandDefinition {
	/**
	 * @param {object} options Serializable metadata plus transient executor functions.
	 */
	constructor(options = {}) {
		assertDefinition(options);
		this.id = options.id;
		this.version = Number(options.version || 1);
		this.label = options.label;
		this.description = options.description || '';
		this.domain = options.domain || options.id.split('.')[0];
		this.level = DISCLOSURE_LEVELS.has(options.level) ? options.level : 'professional';
		this.tags = Array.isArray(options.tags) ? [...options.tags] : [];
		this.parameters = clonePlain(options.parameters || {});
		this.context = clonePlain(options.context || {});
		this.surfaces = Array.isArray(options.surfaces) ? [...options.surfaces] : [];
		this.projectionHints = clonePlain(options.projectionHints || {});
		this.mutation = options.mutation || 'canonical';
		this.executor = options.executor;
		this.summarizeResult = options.summarizeResult || defaultSummary;
		this.isAvailable = options.isAvailable || (() => ({ available: true, reason: '' }));
	}

	/** Validates caller values before Gevurah permits mutation. */
	validate(parameters) {
		return validateParameters(this.id, this.parameters, parameters);
	}

	/** Resolves contextual availability without hiding the capability from discovery. */
	availability(state, parameters = {}) {
		return normalizeAvailability(this.isAvailable({ state, parameters }));
	}

	/** Returns function-free metadata safe for UI, JSON, scripting, or AI inspection. */
	metadata() {
		return clonePlain({
			id: this.id,
			version: this.version,
			label: this.label,
			description: this.description,
			domain: this.domain,
			level: this.level,
			tags: this.tags,
			parameters: this.parameters,
			context: this.context,
			surfaces: this.surfaces,
			projectionHints: this.projectionHints,
			mutation: this.mutation
		});
	}
}

function assertDefinition(options) {
	if (!COMMAND_ID_PATTERN.test(options.id || '')) {
		throw new TypeError(`Invalid command id: ${options.id || '(missing)'}.`);
	}

	if (!options.label || typeof options.executor !== 'function') {
		throw new TypeError(`${options.id}: label and executor are required.`);
	}
}

function normalizeAvailability(value) {
	if (typeof value === 'boolean') {
		return {
			available: value,
			reason: value ? '' : 'Command is unavailable in this context.'
		};
	}

	return {
		available: value?.available !== false,
		reason: value?.reason || ''
	};
}

function defaultSummary(result) {
	return result === undefined ? null : clonePlain(result);
}
