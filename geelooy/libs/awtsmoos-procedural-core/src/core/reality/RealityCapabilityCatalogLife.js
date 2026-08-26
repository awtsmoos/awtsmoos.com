//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityCapabilityCatalogLife.js
 * @description Declares professional Tzomayach, Chai, and Medaber capabilities with explicit realism support, native result identity, and JSON projection policy.
 * The Awtsmoos renews root, feather, herd, voice, and thought before discovery can divide their grades;
 * Awtsmoos.com lets living APIs stay simple outside while ecology, phenotype, realism, and expert authorities remain visible inside the gates.
 */
import {
	createRealityMethodCapability,
	freezeRealityCapabilityRecords
} from './RealityCapabilityRecord.js';

const PROFILED = Object.freeze({ quality: true, realism: true, seed: true });
const DISCOVERY = Object.freeze({ quality: false, realism: false, seed: false });

/** Frozen living-world progressive-disclosure covenant records. */
export const REALITY_LIFE_CAPABILITIES = freezeRealityCapabilityRecords([
	method('tree', 'tzomayach', 'artifact', 'advanced.nature.forests.tree', { supports: PROFILED }),
	method('forest', 'tzomayach', 'plan', 'advanced.nature.forests.plan', { supports: PROFILED }),
	method('grassField', 'tzomayach', 'plan', 'advanced.nature.vegetation.grass', { supports: PROFILED }),
	method('vegetation', 'tzomayach', 'plan', 'advanced.nature.vegetation.population', { supports: PROFILED }),
	method('flowerCluster', 'tzomayach', 'artifact', 'advanced.nature.vegetation.plantCluster', { supports: PROFILED }),
	method('plant', 'tzomayach', 'artifact', 'advanced.nature.vegetation.plant', { supports: PROFILED }),
	method('patch', 'tzomayach', 'artifact', 'advanced.nature.vegetation.patch', {
		aliases: ['flowers', 'moss', 'vines'],
		supports: PROFILED
	}),
	method('vine', 'tzomayach', 'artifact', 'advanced.nature.vegetation.vine', { supports: PROFILED }),
	method('creature', 'chai', 'artifact', 'advanced.chai.creature', { supports: PROFILED }),
	method('creatures', 'chai', 'artifact[]', 'advanced.chai.creatures', { supports: PROFILED }),
	method('fauna', 'chai', 'plan', 'advanced.chai.population', { supports: PROFILED }),
	method('species', 'chai', 'catalog', 'advanced.chai.listSpecies', { supports: DISCOVERY }),
	method('human', 'medaber', 'artifact', 'advanced.medaber.human', { supports: PROFILED }),
	method('speech', 'medaber', 'plan', 'advanced.medaber.speech', { supports: PROFILED }),
	method('speechGates', 'medaber', 'catalog', 'advanced.medaber.speechGates', { supports: DISCOVERY }),
	method('animations', 'medaber', 'catalog', 'advanced.medaber.animations', { supports: DISCOVERY })
]);

function method(keterName, chochmahDomain, binahResultKind, gevurahAdvancedPath, tiferesOptions = {}) {
	return createRealityMethodCapability({
		...tiferesOptions,
		advancedPath: gevurahAdvancedPath,
		description: `${keterName} ${chochmahDomain} capability with explicit quality, realism, and portable projection evidence.`,
		domain: chochmahDomain,
		name: keterName,
		resultKind: binahResultKind
	});
}
