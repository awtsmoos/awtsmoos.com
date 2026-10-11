// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBootStateMachine.test.js
 * @description Proves one state machine owns bootStage, runtimeState, and the veil — ready is
 * unreachable while starting or failed, and failed is terminal.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	deriveMitzvahWorldRuntimeState,
	ensureMitzvahWorldBootVeil,
	readMitzvahWorldBootState,
	restartMitzvahWorldBootState,
	transitionMitzvahWorldBootState
} from './MitzvahWorldBootStateMachine.js';
import {
	probeMitzvahWorldWebGlCapability,
	readMitzvahWorldWebGlCapability,
	rememberMitzvahWorldWebGlCapability,
	WEBGL_UNAVAILABLE_CODE
} from './MitzvahWorldWebGlCapabilityGate.js';
import { createEssentialTestEnvironment } from './MitzvahWorldEssentialTestEnvironment.js';

function fakeDocument() {
	const dataset = {};
	const attrs = {};
	const veil = {
		dataset: {},
		hidden: false,
		setAttribute(name, value) { attrs[`veil:${name}`] = value; }
	};
	const root = {
		dataset: {},
		setAttribute(name, value) { attrs[`root:${name}`] = value; }
	};
	const documentElement = {
		dataset: {},
		setAttribute(name, value) { attrs[`html:${name}`] = value; }
	};
	return {
		_attrs: attrs,
		documentElement,
		getElementById(id) {
			if (id === 'mitzvah-world-root') return root;
			if (id === 'menuBoot') return veil;
			return null;
		},
		_root: root,
		_veil: veil
	};
}

function fakeEnvironment() {
	return { performance: { now: () => 1000 } };
}

test('ready is refused while starting', () => {
	const environment = fakeEnvironment();
	const document = fakeDocument();
	const result = transitionMitzvahWorldBootState(environment, document, 'ready', null);
	assert.equal(result, 'starting');
	assert.equal(document._root.dataset.awtsmoosBootStage, 'starting');
	assert.equal(document._root.dataset.awtsmoosRuntime, 'starting');
	assert.equal(document.documentElement.dataset.awtsmoosRuntimeState, 'starting');
});

test('legal chain reaches ready and publishes one truth everywhere', () => {
	const environment = fakeEnvironment();
	const document = fakeDocument();
	for (const state of ['detecting-webgl', 'painting', 'renderer-creating', 'first-frame-painting', 'world-loading', 'ready']) {
		transitionMitzvahWorldBootState(environment, document, state, null);
	}
	assert.equal(readMitzvahWorldBootState(environment).state, 'ready');
	assert.equal(document._root.dataset.awtsmoosBootStage, 'ready');
	assert.equal(document._root.dataset.awtsmoosRuntime, 'playable');
	assert.equal(document._root.dataset.awtsmoosRuntimeState, 'playable');
	assert.equal(document.documentElement.dataset.awtsmoosGameplay, 'true');
	assert.equal(document._veil.hidden, true);
	assert.equal(document._root.dataset.awtsmoosMenuReady, 'true');
});

test('failed is terminal: ready is refused afterwards', () => {
	const environment = fakeEnvironment();
	const document = fakeDocument();
	transitionMitzvahWorldBootState(environment, document, 'painting', null);
	transitionMitzvahWorldBootState(environment, document, 'failed', { code: 'WEBGL_UNAVAILABLE', message: 'nope' });
	assert.equal(transitionMitzvahWorldBootState(environment, document, 'ready', null), 'failed');
	assert.equal(document._root.dataset.awtsmoosRuntime, 'failed');
	assert.equal(document._root.dataset.awtsmoosRuntimeError, 'nope');
	assert.equal(document._veil.hidden, false);
});

test('restart returns to starting from failed', () => {
	const environment = fakeEnvironment();
	const document = fakeDocument();
	transitionMitzvahWorldBootState(environment, document, 'failed', { code: 'X' });
	assert.equal(restartMitzvahWorldBootState(environment, document), 'starting');
	assert.equal(document._root.dataset.awtsmoosRuntime, 'starting');
});

test('runtime state derives from the single machine', () => {
	assert.equal(deriveMitzvahWorldRuntimeState('starting'), 'starting');
	assert.equal(deriveMitzvahWorldRuntimeState('world-loading'), 'starting');
	assert.equal(deriveMitzvahWorldRuntimeState('ready'), 'playable');
	assert.equal(deriveMitzvahWorldRuntimeState('failed'), 'failed');
});

test('veil stays visible while not ready', () => {
	const environment = fakeEnvironment();
	const document = fakeDocument();
	transitionMitzvahWorldBootState(environment, document, 'world-loading', null);
	ensureMitzvahWorldBootVeil(environment, document);
	assert.equal(document._veil.hidden, false);
	assert.equal(document._root.dataset.awtsmoosMenuReady, undefined);
});

test('capability probe stays unknown without a document (never fails closed)', () => {
	const evidence = probeMitzvahWorldWebGlCapability({});
	assert.equal(evidence.supported, null);
	assert.equal(evidence.code, 'WEBGL_UNKNOWN');
	assert.deepEqual(evidence.contextAttempts, ['webgl', 'experimental-webgl']);
});

test('capability probe fails closed when the DOM exists but WebGL does not', () => {
	const environment = {
		document: {
			createElement: () => ({ getContext: () => null })
		},
		performance: { now: () => 1000 }
	};
	const evidence = probeMitzvahWorldWebGlCapability(environment);
	assert.equal(evidence.supported, false);
	assert.equal(evidence.code, WEBGL_UNAVAILABLE_CODE);
});

test('capability evidence round-trips on the environment', () => {
	const environment = fakeEnvironment();
	assert.equal(readMitzvahWorldWebGlCapability(environment), null);
	const evidence = probeMitzvahWorldWebGlCapability(environment);
	rememberMitzvahWorldWebGlCapability(environment, evidence);
	assert.equal(readMitzvahWorldWebGlCapability(environment).code, 'WEBGL_UNKNOWN');
});

test('essential boot fails closed with WEBGL_UNAVAILABLE before any milestone clock starts', async () => {
	const boot = await import('./MitzvahWorldEssentialBoot.js');
	const environment = createEssentialTestEnvironment();
	environment.document = {
		createElement: () => ({ getContext: () => null })
	};
	environment.location = { href: 'https://example.test/' };
	assert.throws(
		() => boot.initializeMitzvahWorldEssentialBoot(environment),
		(error) => error.code === WEBGL_UNAVAILABLE_CODE
	);
	const snapshot = boot.getMitzvahWorldEssentialBootSnapshot(environment);
	assert.equal(snapshot.stalledMilestone.name, boot.ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME);
	assert.equal(snapshot.stalledMilestone.failureCode, WEBGL_UNAVAILABLE_CODE);
	// The first-frame silence clock never started: the record never activated.
	assert.equal(
		snapshot.milestones[boot.ESSENTIAL_MILESTONES.RENDERER_FIRST_FRAME].startedAtMilliseconds,
		null
	);
});
