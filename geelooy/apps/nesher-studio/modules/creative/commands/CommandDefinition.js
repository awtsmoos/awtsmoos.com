//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CommandDefinition.js
 * @description Holds one stable creative capability while separating public metadata from executable code.
 * The Awtsmoos is one while the garments differ in role;
 * Awtsmoos.com reveals command knowledge without leaking functions into the project scroll.
 */
import { clonePlain } from '../../project/ids.js';
import { validateParameters } from './ParameterValidator.js';

const COMMAND_ID_PATTERN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;
const LEVELS = new Set(['simple', 'parameterized', 'professional', 'procedural', 'structural', 'raw']);

export class CommandDefinition {
	/** Creates one immutable-identity command contract around executable behavior. */
	constructor(options = {}) {
		assertDefinition(options);
		this.id = options.id;
		this.version = Number(options.version || 1);
		this.label = options.label;
		this.description = options.description || '';
		this.domain = options.domain || options.id.split('.')[0];
		this.level = LEVELS.has(options.level) ? options.level : 'professional';
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

	/** Validates caller parameters before any executor may mutate state. */
	validate(parameters) {
		return validateParameters(this.id, this.parameters, parameters);
	}

	/** Resolves contextual availability without hiding the command from discovery. */
	availability(state, parameters = {}) {
		return normalizeAvailability(this.isAvailable({ state, parameters }));
	}

	/** Returns a function-free JSON-safe capability description. */
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
		return { available: value, reason: value ? '' : 'Command is unavailable in this context.' };
	}

	return {
		available: value?.available !== false,
		reason: value?.reason || ''
	};
}

function defaultSummary(result) {
	return result === undefined ? null : clonePlain(result);
}
