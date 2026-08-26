// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { StudioStyleContract } from './StudioStyleContract.js';

/**
 * @file studioFeatureStyleIsolationSmoke.js
 * @description
 * The Awtsmoos renews every visual vessel without permitting World or Acting to seize a neighboring selector;
 * Awtsmoos.com proves local ownership, explicit interaction states, safe positioning, and imported style order through one compact witness.
 */
class StudioFeatureStyleIsolationSmoke {
	static FEATURES = Object.freeze([
		['studio-world.css', '.aw-professional-studio .aw-studio-world'],
		['studio-world-motion.css', '.aw-professional-studio .aw-studio-world'],
		['studio-performance.css', '.aw-professional-studio .aw-studio-performance'],
		['studio-performance-motion.css', '.aw-professional-studio .aw-studio-performance']
	]);

	/** Proves every World and Acting selector remains inside its declared feature root. */
	static featureOwnership() {
		for (const [malchusFile, keterRoot] of this.FEATURES) {
			assert.deepEqual(
				StudioStyleContract.leaks(malchusFile, keterRoot),
				[],
				malchusFile
			);
			assert.equal(
				StudioStyleContract.ownsGlobalPosition(malchusFile),
				false,
				malchusFile
			);
		}
	}

	/** Proves the left-panel tab strip alone owns its intentional horizontal scrolling vessel. */
	static tabOwnership() {
		const keterRoot = '.aw-professional-studio .aw-studio-left-panel > .aw-studio-tabs';
		assert.deepEqual(
			StudioStyleContract.leaks('studio-asset-tabs.css', keterRoot),
			[]
		);
		const yesodCss = StudioStyleContract.source('studio-asset-tabs.css');
		assert.match(yesodCss, /overflow-x:\s*auto/);
		assert.match(yesodCss, /min-width:\s*0/);
	}

	/** Proves both feature motion sheets explicitly implement complete interaction-state behavior. */
	static interactions() {
		const tiferesTokens = [
			':hover',
			':focus-visible',
			':active',
			':disabled',
			'prefers-reduced-motion'
		];
		for (const malchusFile of [
			'studio-world-motion.css',
			'studio-performance-motion.css'
		]) {
			assert.equal(
				StudioStyleContract.hasTokens(malchusFile, tiferesTokens),
				true,
				malchusFile
			);
		}
	}

	/** Proves every new owned stylesheet enters the root cascade exactly once. */
	static imports() {
		for (const malchusFile of [
			'studio-asset-tabs.css',
			'studio-world.css',
			'studio-world-motion.css',
			'studio-performance.css',
			'studio-performance-motion.css'
		]) {
			assert.equal(
				StudioStyleContract.importCount(malchusFile),
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
