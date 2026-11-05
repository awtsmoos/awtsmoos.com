// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieWorkspaceStyles.test.mjs
 * @description Proves the missing workspace style boundary imports, renders required selectors, and installs once.
 * The Awtsmoos renews many project windows without duplicate light; Awtsmoos.com verifies
 * that timeline, graph, JSON, touch, and responsive vessels arrive once and remain reusable.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioWorkspace } from '../../movie/MovieStudioWorkspace.js';
import {
	installMovieWorkspaceStyles,
	movieWorkspaceStyleText
} from '../../movie/MovieWorkspaceStyles.js';

function createStyleDocument() {
	const elements = new Map();
	const appended = [];
	return {
		appended,
		createElement(name) {
			return {
				id: '',
				name,
				textContent: ''
			};
		},
		getElementById(id) {
			return elements.get(id) || null;
		},
		head: {
			append(element) {
				appended.push(element);
				elements.set(element.id, element);
			}
		}
	};
}

test('workspace imports with its complete style dependency', () => {
	assert.equal(typeof MovieStudioWorkspace, 'function');
	const css = movieWorkspaceStyleText();
	for (const selector of [
		'.movie-workspace-tabs',
		'.movie-workspace-panel',
		'.movie-graph-node',
		'.movie-workspace-json',
		'@media (max-width:720px)'
	]) {
		assert.equal(css.includes(selector), true, selector);
	}
	assert.equal(css.includes('min-height:44px'), true);
});

test('workspace styles install once and tolerate a missing document', () => {
	const targetDocument = createStyleDocument();
	const first = installMovieWorkspaceStyles(targetDocument);
	const second = installMovieWorkspaceStyles(targetDocument);
	assert.equal(first, second);
	assert.equal(first.id, 'movie-workspace-styles');
	assert.equal(targetDocument.appended.length, 1);
	assert.equal(installMovieWorkspaceStyles(null), null);
});
