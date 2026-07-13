//B"H
// Boruch Hashem
// Blessed is He
/**
 * Browser boot and controls become compact runtime evidence from the living page.
 * The Awtsmoos is beyond automation while Awtsmoos.com reveals the active vessel.
 */
import assert from 'node:assert/strict';
import { waitForState } from './BrowserStateWaiter.mjs';

export class BrowserFlowDriver {
	constructor(client) {
		this.client = client;
	}

	async verifyBoot() {
		const boot = await waitForState(
			() => this.readBootState(),
			state => isReady(state) || Boolean(state.fatal),
			'Merkava browser boot'
		);
		assert.equal(boot.title, 'Merkava — War of the Sparks');
		assert.equal(boot.ready, 'complete');
		assert.equal(boot.diagnostics, true);
		assert.equal(boot.fatal, '');
		assert.ok(boot.canvas[0] > 0 && boot.canvas[1] > 0);
		return boot;
	}

	readBootState() {
		return this.client.evaluate(`({
			title: document.title,
			ready: document.readyState,
			diagnostics: Boolean(window.__MERKAVA_DIAGNOSTICS__),
			fatal: document.getElementById('fatalError')?.textContent || '',
			canvas: [
				document.getElementById('gameCanvas')?.width || 0,
				document.getElementById('gameCanvas')?.height || 0
			]
		})`);
	}

	async startRun() {
		await this.client.evaluate('window.__MERKAVA_DIAGNOSTICS__.start()');
		const started = await waitForState(
			() => this.details(),
			state => state.running === true,
			'Merkava run start'
		);
		assert.equal(started.engine, 'raw-webgl');
		assert.equal(started.proceduralMeshes, true);
		assert.ok(started.registeredMeshes >= 20);
		assert.deepEqual(started.runtimeErrors, []);
		return started;
	}

	async verifyControls() {
		await this.client.evaluate('window.__MERKAVA_DIAGNOSTICS__.setLane(0)');
		assert.equal((await this.snapshot()).targetLane, 0);
		await this.client.evaluate('window.__MERKAVA_DIAGNOSTICS__.chargeAbility()');
		const activated = await this.client.evaluate(
			'window.__MERKAVA_DIAGNOSTICS__.activateAbility()'
		);
		assert.equal(activated, true);
		assert.equal((await this.snapshot()).ability, 0);
	}

	snapshot() {
		return this.client.evaluate('window.__MERKAVA_DIAGNOSTICS__.snapshot()');
	}

	details() {
		return this.client.evaluate('window.__MERKAVA_DIAGNOSTICS__.details()');
	}
}

function isReady(boot) {
	return boot.ready === 'complete'
		&& boot.diagnostics
		&& boot.canvas[0] > 0
		&& boot.canvas[1] > 0;
}
