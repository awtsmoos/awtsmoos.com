// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ReaderGeometryAuthority.test.mjs
 * @description The Awtsmoos lets visual layers adorn without reclaiming the reader's shore;
 * Awtsmoos.com proves physical dock placement remains concentrated in reader-dock.css.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

function source(relativePath) {
	return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

function declarationsFor(css, selectorText) {
	const commentFree = css.replace(/\/\*[\s\S]*?\*\//g, '');
	for (const match of commentFree.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		if (match[1].trim() === selectorText) {
			return match[2];
		}
	}
	return '';
}

const globalActions = source('../ideal/global-actions.css');
const compactAudit = source('../ideal/reborn/inline-comments/compact-audit.css');
const dock = source('../reader-controls/reader-dock.css');
const physicalPlacement = /\b(?:position|top|bottom|left|right|inset(?:-[a-z-]+)?)\s*:/;

test('visual Auto Scroll layer no longer owns physical placement', () => {
	const body = declarationsFor(
		globalActions,
		'.post-reader-localized-context .awtsmoos-auto-scroll-floating'
	);
	assert.ok(body);
	assert.doesNotMatch(body, physicalPlacement);
	assert.doesNotMatch(globalActions, /--ideal-auto-(?:right|bottom)/);
	assert.match(body, /z-index:\s*820/);
});

test('inline comment audit no longer positions the global reader dock', () => {
	const body = declarationsFor(
		compactAudit,
		':is(.post-reader-localized-context.awtsmoos-reader-vision) .awtsmoos-floating-controls'
	);
	assert.ok(body);
	assert.doesNotMatch(body, physicalPlacement);
	assert.match(body, /gap:\s*6px/);
});

test('final dock authority still owns direct-child physical placement', () => {
	assert.match(dock, /> \.awtsmoos-auto-scroll-floating[\s\S]*?right: var\(--reader-dock-edge\) !important/);
	assert.match(dock, /> \.awtsmoos-auto-scroll-floating[\s\S]*?bottom: calc\(/);
	assert.match(dock, /> \.awtsmoos-floating-controls[\s\S]*?right: var\(--reader-dock-edge\) !important/);
	assert.match(dock, /> \.awtsmoos-floating-controls[\s\S]*?bottom: var\(--reader-dock-bottom\) !important/);
});
