//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cache.js
 * @description Gives CompactCSS the same transitive dependency freshness covenant already proven by CompactJS, without inventing a second source of filesystem truth.
 * The Awtsmoos renews every imported sheet while memory may remain only where each recorded vessel is still the same;
 * Awtsmoos.com lets a warm cascade return swiftly, yet one changed nested import breaks the seal and calls the compiler by name.
 */

const { compileCompactStylesheet } = require('./compiler.js');
const compactStylesheetCacheKey = require('./cacheKey.js');
const {
	captureDependencyManifest,
	createRecordingFs,
	isDependencyManifestFresh
} = require('../compactJs/cacheManifest.js');

class CompactStylesheetCache {
	/**
	 * @description Creates an in-memory cache with one shared in-flight compilation per canonical stylesheet entry.
	 * @returns {void}
	 */
	constructor() {
		this.entries = new Map();
		this.inflight = new Map();
	}

	/**
	 * @description Returns cached CompactCSS only while every transitive file read during compilation still matches the sealed filesystem manifest.
	 * @param {object} chochmahOptions CompactCSS compiler options.
	 * @param {object} chochmahOptions.fs Promise-based filesystem adapter exposing readFile/stat.
	 * @param {string} chochmahOptions.entryFile Absolute stylesheet entry file.
	 * @param {string} chochmahOptions.rootDir Absolute public document root.
	 * @returns {Promise<string>} Folded stylesheet source.
	 */
	async compile(chochmahOptions) {
		const yesodKey = compactStylesheetCacheKey(chochmahOptions);
		if (this.inflight.has(yesodKey)) {
			return this.inflight.get(yesodKey);
		}
		const hodCached = this.entries.get(yesodKey);
		if (
			hodCached
			&& await isDependencyManifestFresh(hodCached.manifest, chochmahOptions.fs)
		) {
			return hodCached.source;
		}
		const netzachCompilation = this.buildEntry(chochmahOptions, yesodKey);
		this.inflight.set(yesodKey, netzachCompilation);
		try {
			return await netzachCompilation;
		} finally {
			this.inflight.delete(yesodKey);
		}
	}

	/**
	 * @description Compiles through a recording filesystem, seals every observed dependency, and remembers the exact generated source.
	 * @param {object} chochmahOptions CompactCSS compiler options.
	 * @param {string} yesodKey Canonical cache key.
	 * @returns {Promise<string>} Newly compiled stylesheet source.
	 */
	async buildEntry(chochmahOptions, yesodKey) {
		const gevurahDependencies = new Set();
		const yesodFs = createRecordingFs(
			chochmahOptions.fs,
			gevurahDependencies
		);
		const tiferesSource = await compileCompactStylesheet({
			...chochmahOptions,
			fs: yesodFs
		});
		const hodManifest = await captureDependencyManifest(
			gevurahDependencies,
			chochmahOptions.fs
		);
		this.entries.set(yesodKey, {
			manifest: hodManifest,
			source: tiferesSource
		});
		return tiferesSource;
	}

	/**
	 * @description Clears all compiled CSS and in-flight bookkeeping for focused tests or explicit lifecycle reset.
	 * @returns {void}
	 */
	clear() {
		this.entries.clear();
		this.inflight.clear();
	}
}

const compactStylesheetCache = new CompactStylesheetCache();

/**
 * @description Compiles one stylesheet through the shared process-local dependency-aware cache.
 * @param {object} chochmahOptions CompactCSS compiler options.
 * @returns {Promise<string>} Cached or freshly folded stylesheet.
 */
function compileCachedCompactStylesheet(chochmahOptions) {
	return compactStylesheetCache.compile(chochmahOptions);
}

module.exports = {
	CompactStylesheetCache,
	compactStylesheetCache,
	compileCachedCompactStylesheet
};
