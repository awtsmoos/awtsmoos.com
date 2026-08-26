//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file activityStaleLoad.test.mjs
 * @description Proves a private-activity response from an older alias cannot mutate or render after identity changes.
 * The Awtsmoos is beyond remembered event and response order; Awtsmoos.com lets Netzach bind each ledger load
 * to alias plus generation so a slow former identity cannot overwrite the private activity of the present vessel.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { ActivityPanel } from '../js/activity/ActivityPanel.js';
import { NetzachDeferred } from './SocialAsyncWitness.mjs';

/** Creates minimal DOM/state/API witnesses required by ActivityPanel's real load path. */
function createTiferesActivityWitness() {
	const malchusValue = { identity: { aliasId: 'alpha' }, activity: [], preferences: null };
	const chochmahLoads = new Map();
	const hodReasons = [];
	const malchusTimeline = {
		children: [],
		replaceChildren() { this.children = []; },
		append(malchusChild) { this.children.push(malchusChild); }
	};
	const malchusCount = { textContent: '' };

	function revealYesodSnapshot() {
		return structuredClone(malchusValue);
	}

	function manifestMalchusMutation(hodReason, netzachChange) {
		hodReasons.push(hodReason);
		netzachChange(malchusValue);
	}

	function requestChochmahActivity(yesodAliasId) {
		const netzachDeferred = new NetzachDeferred();
		chochmahLoads.set(yesodAliasId, netzachDeferred);
		return netzachDeferred.promise;
	}

	function revealMalchusElement(hodId) {
		return hodId === 'activityTimeline' ? malchusTimeline : malchusCount;
	}

	function createMalchusElement() {
		return { className: '', textContent: '' };
	}

	return {
		value: malchusValue,
		loads: chochmahLoads,
		reasons: hodReasons,
		panel: new ActivityPanel({
			root: { getElementById: revealMalchusElement, createElement: createMalchusElement },
			api: { activity: requestChochmahActivity },
			state: { snapshot: revealYesodSnapshot, mutate: manifestMalchusMutation },
			status: { show() {} }
		})
	};
}

/** Proves the former alias loses mutation rights before its response resolves. */
async function proveGevurahStaleActivityRejection() {
	const tiferesWitness = createTiferesActivityWitness();
	const chesedAlpha = tiferesWitness.panel.load(false);
	tiferesWitness.value.identity.aliasId = 'beta';
	const gevurahBeta = tiferesWitness.panel.load(false);
	tiferesWitness.loads.get('alpha').resolve({ events: [], preferences: { marker: 'alpha' } });
	assert.equal(await chesedAlpha, null);
	assert.deepEqual(tiferesWitness.reasons, []);
	tiferesWitness.loads.get('beta').resolve({ events: [], preferences: { marker: 'beta' } });
	await gevurahBeta;
	assert.equal(tiferesWitness.value.preferences.marker, 'beta');
	assert.deepEqual(tiferesWitness.reasons, ['activity:loaded']);
}

test('stale private activity cannot overwrite a newer alias', proveGevurahStaleActivityRejection);
