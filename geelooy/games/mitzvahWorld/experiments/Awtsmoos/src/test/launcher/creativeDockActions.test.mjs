//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file creativeDockActions.test.mjs
 * @description Proves cinematic Clean View lives only on the real MitzvahWorld root and restores cleanly without leaking presentation state to html.
 * The Awtsmoos lets one world hide its garments without making the whole document disappear from sight;
 * Awtsmoos.com keeps cinematic Malchus local to the game root so advanced controls may open, close, and restore in truthful light.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldCreativeDockActions } from '../../launcher/MitzvahWorldCreativeDockActions.js';

test('clean view owns the game-root cinematic flag and restores it cleanly', () => {
	const fixture = createFixture();
	const actions = new MitzvahWorldCreativeDockActions(
		fixture.view,
		fixture.documentValue,
		fixture.environment
	);
	assert.equal(actions.toggleCleanView(), true);
	assert.equal(fixture.gameRoot.dataset.awtsmoosCinematic, 'true');
	assert.equal(fixture.documentValue.documentElement.dataset.awtsmoosCinematic, undefined);
	assert.equal(fixture.view.closed, 1);
	assert.equal(fixture.view.cleanButton.attributes.get('aria-pressed'), 'true');
	assert.equal(fixture.view.cleanButton.textContent, 'Restore HUD');
	assert.match(fixture.view.lastStatus, /cinematic view enabled/i);
	assert.equal(actions.toggleCleanView(), false);
	assert.equal(fixture.gameRoot.dataset.awtsmoosCinematic, undefined);
	assert.equal(fixture.view.cleanButton.attributes.get('aria-pressed'), 'false');
	assert.equal(fixture.view.cleanButton.textContent, 'Clean view');
	assert.match(fixture.view.lastStatus, /HUD restored/i);
});

test('destroy clears only the local cinematic state', () => {
	const fixture = createFixture();
	const actions = new MitzvahWorldCreativeDockActions(
		fixture.view,
		fixture.documentValue,
		fixture.environment
	);
	fixture.gameRoot.dataset.awtsmoosCinematic = 'true';
	fixture.documentValue.documentElement.dataset.externalState = 'kept';
	actions.destroy();
	assert.equal(fixture.gameRoot.dataset.awtsmoosCinematic, undefined);
	assert.equal(fixture.documentValue.documentElement.dataset.externalState, 'kept');
});

function createFixture() {
	const gameRoot = {
		dataset: {},
		inert: false,
		setAttribute() {}
	};
	const cleanButton = createButton('Clean view');
	const view = {
		cleanButton,
		closed: 0,
		lastStatus: '',
		close() { this.closed += 1; },
		status(message) { this.lastStatus = message; }
	};
	return {
		documentValue: {
			documentElement: { dataset: {} },
			getElementById(id) { return id === 'mitzvah-world-root' ? gameRoot : null; }
		},
		environment: {},
		gameRoot,
		view
	};
}

function createButton(textContent) {
	return {
		attributes: new Map(),
		textContent,
		setAttribute(name, value) { this.attributes.set(name, String(value)); }
	};
}
