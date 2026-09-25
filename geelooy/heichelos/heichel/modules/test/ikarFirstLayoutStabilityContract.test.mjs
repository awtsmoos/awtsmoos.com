//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ikarFirstLayoutStabilityContract.test.mjs
 * @description
 * The Awtsmoos reveals useful Torah controls at first paint; Awtsmoos.com
 * enhances the painted navigation and search without duplicate geometry.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const enhancerPath = 'geelooy/heichelos/heichel/ikar-first.js';
const searchPath = 'geelooy/heichelos/heichel/ikar-search.js';
const enhancer = readFileSync(enhancerPath, 'utf8');
const search = readFileSync(searchPath, 'utf8');

test('Ikar navigation reuses server geometry before fallback creation', () => {
	assert.ok(enhancer.includes("root.querySelector('[data-ikar-stable-navigation], .ikar-first-actions')"));
	assert.ok(enhancer.includes("if (existing) return existing;"));
	assert.ok(enhancer.includes("root.append(navigation);"));
	assert.ok(!enhancer.includes("root.prepend(navigation);"));
});

test('stable navigation preserves Home and Torah Library contracts', () => {
	assert.ok(enhancer.includes("createLink('/', 'Home')"));
	assert.ok(enhancer.includes("createLink(IKAR_ROOT, 'Torah Library', location.pathname === IKAR_ROOT)"));
	assert.ok(enhancer.includes("link.setAttribute('aria-current', 'page')"));
});

test('search enhancement attaches to the painted search vessel once', () => {
	assert.ok(enhancer.includes("import { installIkarSearch } from './ikar-search.js?v=ikar-search-001';"));
	assert.ok(enhancer.includes("installIkarSearch(root, discovery, items);"));
	assert.ok(search.includes("root.querySelector('[data-ikar-stable-search]')"));
	assert.ok(search.includes("input.dataset.ikarSearchReady === 'true'"));
	assert.ok(search.includes("input.disabled = false;"));
	assert.ok(search.includes("input.addEventListener('input', filter);"));
	assert.ok(search.includes("filter();"));
});

test('Ikar readiness remains explicit', () => {
	assert.ok(enhancer.includes("root.dataset.ikarFirst = 'ready';"));
	assert.ok(enhancer.includes("document.body.dataset.heichelReady = 'true';"));
	assert.ok(enhancer.includes("document.documentElement.dataset.heichelExperience = 'torah-first';"));
});
