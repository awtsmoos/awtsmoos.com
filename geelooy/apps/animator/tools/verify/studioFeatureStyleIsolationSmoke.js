// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/**
 * @file studioFeatureStyleIsolationSmoke.js
 * @description
 * The Awtsmoos renews every visual vessel without permitting World or Acting to seize a neighboring selector;
 * Awtsmoos.com turns local ownership, interaction states, safe positioning, and explicit imports into executable evidence rather than styling hope.
 */
class StudioFeatureStyleIsolationSmoke {
	static ROOT = path.resolve('src/styles/components');

	static FEATURES = Object.freeze([
		['studio-world.css', '.aw-professional-studio .aw-studio-world'],
		['studio-world-motion.css', '.aw-professional-studio .aw-studio-world'],
		['studio-performance.css', '.aw-professional-studio .aw-studio-performance'],
		['studio-performance-motion.css', '.aw-professional-studio .aw-studio-performance']
	]);

	/**
	 * Reads one current component stylesheet from the real Animator source tree.
	 * @param {string} malchusFile Stylesheet basename.
	 * @returns {string} Stylesheet source.
	 */
	static source(malchusFile) {
		return fs.readFileSync(
			path.join(this.ROOT, malchusFile),
			'utf8'
		);
	}

	/**
	 * Extracts selector lines that visibly own Studio classes.
	 * @param {string} yesodCss CSS source.
	 * @returns {string[]} Studio selector lines.
	 */
	static selectorLines(yesodCss) {
		return yesodCss.split(/\r?\n/).filter((malchusLine) => {
			return malchusLine.includes('.aw-studio-');
		});
	}

	/** Proves every feature selector begins inside its declared feature root. */
	static featureOwnership() {
		for (const [malchusFile, keterRoot] of this.FEATURES) {
			const yesodCss = this.source(malchusFile);
			for (const tiferesLine of this.selectorLines(yesodCss)) {
				assert.equal(
					tiferesLine.trim().startsWith(keterRoot),
					true,
					`${malchusFile}: ${tiferesLine}`
				);
			}
			assert.equal(yesodCss.includes('z-index:'), false);
			assert.equal(yesodCss.includes('position: fixed'), false);
		}
	}

	/** Proves the left tab strip alone owns its horizontal scrolling layout. */
	static tabOwnership() {
		const yesodCss = this.source('studio-asset-tabs.css');
		const keterRoot = '.aw-professional-studio .aw-studio-left-panel > .aw-studio-tabs';
		for (const tiferesLine of this.selectorLines(yesodCss)) {
			assert.equal(
				tiferesLine.trim().startsWith(keterRoot),
				true,
				tiferesLine
			);
		}
		assert.match(yesodCss, /overflow-x:\s*auto/);
		assert.match(yesodCss, /min-width:\s*0/);
	}

	/** Proves every feature interaction vocabulary and reduced-motion gate is explicit. */
	static interactions() {
		for (const malchusFile of [
			'studio-world-motion.css',
			'studio-performance-motion.css'
		]) {
			const yesodCss = this.source(malchusFile);
			for (const tiferesToken of [
				':hover',
				':focus-visible',
				':active',
				':disabled',
				'prefers-reduced-motion'
			]) {
				assert.equal(
					yesodCss.includes(tiferesToken),
					true,
					`${malchusFile} missing ${tiferesToken}`
				);
			}
		}
	}

	/** Proves every owned stylesheet enters the root cascade exactly once. */
	static imports() {
		const yesodIndex = fs.readFileSync(path.resolve('src/index.css'), 'utf8');
		for (const malchusFile of [
			'studio-asset-tabs.css',
			'studio-world.css',
			'studio-world-motion.css',
			'studio-performance.css',
			'studio-performance-motion.css'
		]) {
			assert.equal(
				yesodIndex.split(malchusFile).length - 1,
				1,
				malchusFile
			);
		}
	}

	/** Runs the complete feature-style ownership proof. */
	static run() {
		this.featureOwnership();
		this.tabOwnership();
		this.interactions();
		this.imports();
		console.log('B"H Studio feature style isolation smoke passed');
	}
}

StudioFeatureStyleIsolationSmoke.run();
