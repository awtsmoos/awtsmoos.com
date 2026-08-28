//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralExtensionApi.js
 * @description Centralizes trusted runtime extension registration so compiler specialists, domains, generators, operations, and semantic resolvers enter one shared authority constellation.
 * The Awtsmoos renews every extension while no plugin becomes the source of the language it serves;
 * Awtsmoos.com lets Chesed widen capability through explicit registries and Gevurah prevents hidden overwrite curves.
 */

import { registerProceduralLanguagePlugin } from '../plugin/registerProceduralLanguagePlugin.js';

export class ProceduralExtensionApi {
	/**
	 * @description Captures all shared extension registries once so inherited execution surfaces can expand capability without duplicating authority state.
	 * @param {object} chochmahAuthorities Shared procedural-language authority constellation.
	 */
	constructor(chochmahAuthorities) {
		this.registry = chochmahAuthorities.registry;
		this.resolverRegistry = chochmahAuthorities.resolverRegistry;
		this.compilerRegistry = chochmahAuthorities.compilerRegistry;
		this.generatorRegistry = chochmahAuthorities.generatorRegistry;
		this.domainRegistry = chochmahAuthorities.domainRegistry;
	}

	/**
	 * @description Registers one trusted namespaced plugin across every compatible shared registry under explicit overwrite policy.
	 * @param {object} chochmahPlugin Trusted plugin manifest containing serializable descriptions and optional executable runtime authorities.
	 * @param {{override?: boolean}} [gevurahOptions={}] Explicit overwrite policy for stable registry identities.
	 * @returns {Readonly<object>} Frozen serializable plugin receipt containing ids/namespaces but never executable functions.
	 */
	use(chochmahPlugin, gevurahOptions = {}) {
		return registerProceduralLanguagePlugin(chochmahPlugin, {
			languageRegistry: this.registry,
			resolverRegistry: this.resolverRegistry,
			compilerRegistry: this.compilerRegistry,
			generatorRegistry: this.generatorRegistry,
			domainRegistry: this.domainRegistry,
			override: gevurahOptions.override === true
		});
	}

	/**
	 * @description Registers one semantic compiler capability beside an optional trusted private executor.
	 * @param {object} chochmahCapability Serializable compiler capability descriptor.
	 * @param {Function|null} [tiferesExecutor=null] Trusted runtime compiler executor kept private by the registry.
	 * @param {{override?: boolean}} [gevurahOptions={}] Explicit duplicate-id overwrite policy.
	 * @returns {ProceduralExtensionApi} This extension authority for fluent setup.
	 */
	registerCompiler(chochmahCapability, tiferesExecutor = null, gevurahOptions = {}) {
		this.compilerRegistry.register(
			chochmahCapability,
			tiferesExecutor,
			gevurahOptions
		);
		return this;
	}

	/**
	 * @description Registers one deterministic named definition generator in the shared generator registry.
	 * @param {string} yesodId Stable generator id.
	 * @param {Function} tiferesGenerator Trusted deterministic definition generator.
	 * @param {object} [gevurahOptions={}] Generator-registry registration options.
	 * @returns {ProceduralExtensionApi} This extension authority for fluent setup.
	 */
	registerGenerator(yesodId, tiferesGenerator, gevurahOptions = {}) {
		this.generatorRegistry.register(yesodId, tiferesGenerator, gevurahOptions);
		return this;
	}

	/**
	 * @description Registers one optional domain-specific generate/compile/resolve authority under a semantic kind.
	 * @param {string} yesodKind Stable domain kind selector.
	 * @param {object} tiferesAuthority Trusted domain authority implementation.
	 * @param {object} [gevurahOptions={}] Domain-registry registration options.
	 * @returns {ProceduralExtensionApi} This extension authority for fluent setup.
	 */
	registerDomain(yesodKind, tiferesAuthority, gevurahOptions = {}) {
		this.domainRegistry.register(yesodKind, tiferesAuthority, gevurahOptions);
		return this;
	}
}
