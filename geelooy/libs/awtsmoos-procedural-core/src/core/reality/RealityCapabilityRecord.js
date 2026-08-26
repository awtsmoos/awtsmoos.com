//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityRecord.js
 * @description Defines one professional immutable covenant for Reality methods, namespaces, properties, and package exports while preserving historical discovery fields.
 * The Awtsmoos renews every doorway before JavaScript, JSON, documentation, or tooling can name the finite path;
 * Awtsmoos.com lets one covenant reveal native power and portable projection together, so progressive disclosure never divides one truth in half.
 */
import {
	REALITY_CAPABILITY_COSTS,
	REALITY_JSON_PROJECTIONS,
	REALITY_SIDE_EFFECT_LEVELS,
	REALITY_SURFACE_KINDS,
	freezeRealityCapabilityValue,
	realityCapabilityEnum
} from './RealityCapabilityValue.js';
import {
	defaultRealityCapabilityCost,
	defaultRealityJsonProjection,
	defaultRealityParamsSchema,
	defaultRealitySideEffects
} from './RealityCapabilityPolicy.js';

/** Creates one callable Reality method capability while preserving `easyMethod`. */
export function createRealityMethodCapability(keterInput) {
	const publicPath = requiredText(keterInput.name, 'method capability name');
	return createCapability({ ...keterInput, easyMethod: publicPath, publicPath, surfaceKind: 'method' });
}

/** Creates one nested Reality namespace capability while preserving the historical domain helper. */
export function createRealityDomainCapability(keterInput) {
	return createCapability({
		...keterInput,
		publicPath: requiredText(keterInput.publicPath, 'namespace public path'),
		surfaceKind: 'namespace'
	});
}

/** Creates one readable non-callable Reality property capability. */
export function createRealityPropertyCapability(keterInput) {
	return createCapability({
		...keterInput,
		publicPath: requiredText(keterInput.publicPath, 'property public path'),
		surfaceKind: 'property'
	});
}

/** Creates one package/export capability while preserving `easyExport`. */
export function createRealityExportCapability(keterInput) {
	const publicPath = requiredText(keterInput.exportName, 'export capability name');
	return createCapability({ ...keterInput, easyExport: publicPath, publicPath, surfaceKind: 'export' });
}

/** Freezes a complete descriptor collection so catalog metadata cannot become runtime state. */
export function freezeRealityCapabilityRecords(keterRecords) {
	return Object.freeze([...keterRecords]);
}

function createCapability(keterInput) {
	const surfaceKind = realityCapabilityEnum(keterInput.surfaceKind, REALITY_SURFACE_KINDS, 'surface kind');
	const domain = requiredText(keterInput.domain, 'capability domain');
	const publicPath = requiredText(keterInput.publicPath, 'capability public path');
	const nativeResultKind = requiredText(keterInput.nativeResultKind ?? keterInput.resultKind, 'native result kind');
	const resultKind = requiredText(keterInput.resultKind ?? nativeResultKind, 'capability result kind');
	const jsonProjection = realityCapabilityEnum(
		keterInput.jsonProjection ?? defaultRealityJsonProjection(resultKind),
		REALITY_JSON_PROJECTIONS,
		'JSON projection'
	);
	const record = {
		...keterInput,
		aliases: [...(keterInput.aliases || [])].map(String),
		cost: realityCapabilityEnum(keterInput.cost ?? defaultRealityCapabilityCost(resultKind), REALITY_CAPABILITY_COSTS, 'cost'),
		description: String(keterInput.description || `${publicPath} Reality capability.`),
		deterministic: keterInput.deterministic !== false,
		domain,
		examples: [...(keterInput.examples || [])],
		id: String(keterInput.id || capabilityId(surfaceKind, publicPath)),
		jsonEnabled: jsonProjection !== 'native-only',
		jsonProjection,
		label: String(keterInput.label || publicPath),
		nativeAvailable: keterInput.nativeAvailable !== false,
		nativeResultKind,
		paramsSchema: keterInput.paramsSchema ?? defaultRealityParamsSchema(surfaceKind),
		publicPath,
		resultKind,
		resultSchema: keterInput.resultSchema ?? null,
		sideEffects: realityCapabilityEnum(keterInput.sideEffects ?? defaultRealitySideEffects(resultKind), REALITY_SIDE_EFFECT_LEVELS, 'side-effect level'),
		stability: String(keterInput.stability || 'stable'),
		supports: normalizeSupport(keterInput.supports),
		surfaceKind
	};
	delete record.name;
	delete record.exportName;
	return freezeRealityCapabilityValue(record, `capability.${record.id}`);
}

function normalizeSupport(keterSupport = {}) {
	return {
		quality: Boolean(keterSupport.quality),
		realism: Boolean(keterSupport.realism),
		seed: Boolean(keterSupport.seed)
	};
}

function capabilityId(surfaceKind, publicPath) {
	return `${surfaceKind === 'export' ? 'package' : 'reality'}.${publicPath}`;
}

function requiredText(keterValue, chochmahLabel) {
	const binahText = String(keterValue ?? '').trim();
	if (!binahText) throw new TypeError(`B"H | Reality ${chochmahLabel} cannot be empty.`);
	return binahText;
}
