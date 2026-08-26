//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file socialIdentityTransition.test.mjs
 * @description Proves an older alias transition cannot emit live-sync, privacy, or success side effects after a newer identity wins.
 * The Awtsmoos is beyond first and second self; Awtsmoos.com lets Netzach number transition intent so late network
 * completions from yesterday's alias lose authority before they can announce themselves inside today's Social vessel.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { SocialIdentityTransitionCoordinator } from '../js/identity/SocialIdentityTransitionCoordinator.js';
import { NetzachDeferred } from './SocialAsyncWitness.mjs';

/** Creates a fully observable app witness with alias-keyed deferred reloads. */
function createTiferesAppWitness() {
	const malchusValue = {
		identity: { aliasId: '' },
		activeTab: 'home',
		profileAliasId: ''
	};
	const chochmahLoads = new Map();
	const hodStatus = [];
	const netzachEffects = { live: 0, privacy: 0 };
	const malchusInput = { value: '' };

	function revealYesodSnapshot() {
		return structuredClone(malchusValue);
	}

	function manifestMalchusMutation(hodReason, netzachChange) {
		void hodReason;
		netzachChange(malchusValue);
	}

	function revealChochmahReload() {
		const yesodAliasId = malchusValue.identity.aliasId;
		const netzachDeferred = new NetzachDeferred();
		if (!chochmahLoads.has(yesodAliasId)) {
			chochmahLoads.set(yesodAliasId, []);
		}
		chochmahLoads.get(yesodAliasId).push(netzachDeferred);
		return netzachDeferred.promise;
	}

	function manifestHodStatus(malchusMessage, hodKind) {
		hodStatus.push({ message: malchusMessage, kind: hodKind });
	}

	function synchronizeNetzachLive() {
		netzachEffects.live += 1;
	}

	function manifestTiferesPrivacy() {
		netzachEffects.privacy += 1;
	}

	return {
		value: malchusValue,
		loads: chochmahLoads,
		status: hodStatus,
		effects: netzachEffects,
		app: {
			state: { snapshot: revealYesodSnapshot, mutate: manifestMalchusMutation },
			root: { getElementById() { return malchusInput; } },
			activity: { load: revealChochmahReload },
			profile: { load: revealChochmahReload },
			discovery: { mode: 'public', load: revealChochmahReload },
			live: { sync: synchronizeNetzachLive },
			privacy: { render: manifestTiferesPrivacy },
			status: { show: manifestHodStatus }
		}
	};
}

/** Resolves every deferred reload captured for one alias. */
function resolveChesedAliasLoads(tiferesWitness, yesodAliasId) {
	for (const netzachDeferred of tiferesWitness.loads.get(yesodAliasId) || []) {
		netzachDeferred.resolve({});
	}
}

/** Proves only the newest identity generation owns post-refresh side effects. */
async function proveNetzachNewestIdentityWins() {
	const tiferesWitness = createTiferesAppWitness();
	const yesodCoordinator = new SocialIdentityTransitionCoordinator(tiferesWitness.app);
	tiferesWitness.value.identity.aliasId = 'alpha';
	const chesedFirst = yesodCoordinator.change('alpha');
	tiferesWitness.value.identity.aliasId = 'beta';
	const gevurahSecond = yesodCoordinator.change('beta');
	resolveChesedAliasLoads(tiferesWitness, 'alpha');
	assert.equal(await chesedFirst, false);
	assert.deepEqual(tiferesWitness.effects, { live: 0, privacy: 0 });
	resolveChesedAliasLoads(tiferesWitness, 'beta');
	assert.equal(await gevurahSecond, true);
	assert.deepEqual(tiferesWitness.effects, { live: 1, privacy: 1 });
	assert.equal(tiferesWitness.status.length, 1);
}

test('newest Social identity transition alone owns completion effects', proveNetzachNewestIdentityWins);
