// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets first creation become testable without pretending tests create it;
 * Awtsmoos.com proves journal, Kesser publication, fatal evidence, and optional ornament
 * remain independent covenants around the flagship's authoritative gameplay vessel.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { KesserMerkavaBootstrap } from '../src/app/KesserMerkavaBootstrap.js';
import { OhrRuntimeJournal } from '../src/app/OhrRuntimeJournal.js';
import { OptionalCommerceGateway } from '../src/app/OptionalCommerceGateway.js';
import { KliInputTarget } from './support/KliInputTarget.mjs';

test('runtime journal preserves legacy array identity and detachable evidence listeners', verifyRuntimeJournal);
test('Kesser publishes app and frozen diagnostics before optional ornament', verifySuccessfulBootstrap);
test('Kesser turns construction failure into journal and bounded fatal UI evidence', verifyFatalBootstrap);
test('optional commerce gateway resolves false instead of rejecting gameplay', verifyOptionalCommerceFailure);

/** Proves normalized runtime evidence and clean listener lifecycle. */
function verifyRuntimeJournal() {
	const kesserWindow = new KliInputTarget();
	const hodErrors = [];
	const journal = new OhrRuntimeJournal({
		windowTarget: kesserWindow,
		consoleTarget: { error: error => hodErrors.push(error.message) }
	}).connect();
	kesserWindow.emit('error', { message: 'spark', filename: 'merkava.js', lineno: 7 });
	kesserWindow.emit('unhandledrejection', { reason: new Error('promise spark') });
	assert.equal(kesserWindow.__MERKAVA_RUNTIME_ERRORS__.length, 2);
	assert.equal(journal.snapshot()[1].message, 'promise spark');
	journal.disconnect();
	assert.equal(kesserWindow.listenerCount('error'), 0);
	assert.equal(kesserWindow.listenerCount('unhandledrejection'), 0);
	assert.deepEqual(hodErrors, []);
}

/** Proves the exact legacy globals remain available through the new composition root. */
function verifySuccessfulBootstrap() {
	const ohrFixture = createBootstrapFixture();
	const tiferesApp = ohrFixture.bootstrap.awaken();
	assert.equal(tiferesApp, ohrFixture.app);
	assert.equal(ohrFixture.window.__MERKAVA_APP__, ohrFixture.app);
	assert.equal(ohrFixture.window.__MERKAVA_DIAGNOSTICS__.engine, 'raw-webgl');
	assert.equal(ohrFixture.window.__MERKAVA_DIAGNOSTICS__.proceduralMeshes, true);
	assert.equal(Object.isFrozen(ohrFixture.window.__MERKAVA_DIAGNOSTICS__), true);
	assert.equal(ohrFixture.commerceCalls.count, 1);
	assert.ok(Array.isArray(ohrFixture.window.__MERKAVA_RUNTIME_ERRORS__));
}

/** Proves failure cannot leave a half-published app and remains visible to player and tooling. */
function verifyFatalBootstrap() {
	const ohrFixture = createBootstrapFixture({ bootError: new Error('creation fracture') });
	assert.equal(ohrFixture.bootstrap.awaken(), null);
	assert.equal(ohrFixture.window.__MERKAVA_APP__, undefined);
	assert.equal(ohrFixture.fatal.style.display, 'block');
	assert.match(ohrFixture.fatal.textContent, /creation fracture/);
	assert.equal(ohrFixture.window.__MERKAVA_RUNTIME_ERRORS__[0].type, 'boot');
}

/** Proves an unavailable optional feature becomes warning evidence, never a rejected boot. */
async function verifyOptionalCommerceFailure() {
	const hodWarnings = [];
	const gateway = new OptionalCommerceGateway({
		moduleLoader: async () => { throw new Error('wallet unavailable'); },
		consoleTarget: { warn: (...values) => hodWarnings.push(values) }
	});
	assert.equal(await gateway.awaken(), false);
	assert.equal(hodWarnings.length, 1);
}

/** Builds one explicit browser/bootstrap vessel without constructing raw WebGL. */
function createBootstrapFixture({ bootError = null } = {}) {
	const kesserWindow = new KliInputTarget();
	const gevurahFatal = { style: {}, textContent: '' };
	const malchusDocument = {
		getElementById: id => id === 'fatalError' ? gevurahFatal : null
	};
	const tiferesApp = Object.freeze({ id: 'merkava-test-app' });
	const netzachCommerceCalls = { count: 0 };
	const hodJournal = new OhrRuntimeJournal({
		windowTarget: kesserWindow,
		consoleTarget: { error() {} }
	});
	const bootstrap = new KesserMerkavaBootstrap({
		windowTarget: kesserWindow,
		documentTarget: malchusDocument,
		appFactory: () => {
			if (bootError) throw bootError;
			return tiferesApp;
		},
		diagnosticsFactory: () => ({ details: () => ({ healthy: true }) }),
		journal: hodJournal,
		commerce: { awaken: () => { netzachCommerceCalls.count += 1; } }
	});
	return {
		bootstrap,
		window: kesserWindow,
		fatal: gevurahFatal,
		app: tiferesApp,
		commerceCalls: netzachCommerceCalls
	};
}
