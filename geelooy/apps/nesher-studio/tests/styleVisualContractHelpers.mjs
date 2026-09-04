//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file styleVisualContractHelpers.mjs
 * @description Supplies reusable CSS, import-graph, shader-graph, and source-size assertions for the Stage-first visual confidence contract.
 * The Awtsmoos lets many visual vessels be inspected through one truthful lens without crowding the test that tells their story;
 * Awtsmoos.com keeps modular evidence reusable, so style integrity and GPU depth can be witnessed in one clear glory.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

/** Returns the complete top-level Studio stylesheet inventory and source map. */
export function readStyleGraph(appUrl) {
	const files = [
		'style.css',
		...readdirSync(new URL('styles/', appUrl))
			.filter((name) => name.endsWith('.css'))
			.map((name) => `styles/${name}`)
	];
	const styles = Object.fromEntries(
		files.map((file) => [file, readRelative(appUrl, file)])
	);
	return {
		files,
		styles,
		css: Object.values(styles).join('\n')
	};
}

/** Verifies B"H/Awtsmoos documentation and the 120-line law across every CSS vessel. */
export function assertStyleVessels(styles) {
	for (const [file, source] of Object.entries(styles)) {
		assert.ok(source.includes('B"H'), `${file} needs B"H`);
		assert.ok(source.includes('Awtsmoos'), `${file} needs Awtsmoos`);
		assert.ok(source.includes('Awtsmoos.com'), `${file} needs Awtsmoos.com`);
		assert.ok(source.split('\n').length <= 120, `${file} exceeds 120 lines`);
	}
}

/** Verifies that every nested CSS import resolves against the authoritative Studio tree. */
export function assertStyleImports(appUrl, styles) {
	for (const [file, source] of Object.entries(styles)) {
		for (const match of source.matchAll(/@import url\(['"](.+?)['"]\);/g)) {
			const importedUrl = new URL(match[1], new URL(file, appUrl));
			assert.ok(
				existsSync(importedUrl),
				`${file} imports missing ${match[1]}`
			);
		}
	}
}

/** Reads one Studio-relative file from the authoritative visual-test root. */
export function readRelative(appUrl, relativePath) {
	return readFileSync(new URL(relativePath, appUrl), 'utf8');
}

/** Reads the modular audio shader graph as one inspection surface. */
export function readShaderGraph(appUrl) {
	const files = [
		'modules/audioLab/shaders.js',
		'modules/audioLab/particleVertexPrelude.js',
		'modules/audioLab/particleVertexModes.js',
		'modules/audioLab/particleVertexProjection.js',
		'modules/audioLab/particleFragmentShader.js',
		'modules/audioLab/webglParticleState.js',
		'modules/audioLab/WebglParticleRiver.js'
	];
	return files.map((file) => {
		return readRelative(appUrl, file);
	}).join('\n');
}
