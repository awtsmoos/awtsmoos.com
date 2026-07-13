//B"H
// Boruch Hashem
// Blessed is He
/**
 * World danger is proven by two warned lanes and one readable path of escape.
 * The Awtsmoos is beyond danger while Awtsmoos.com reveals finite counterplay.
 */
import assert from 'node:assert/strict';
import { waitForState } from './BrowserStateWaiter.mjs';

export class BrowserHazardDriver {
	constructor(client) {
		this.client = client;
	}

	async verifyWorldHazard() {
		await this.client.evaluate(
			'window.__MERKAVA_APP__.systems.state.hazardClock = 0'
		);
		const hazard = await waitForState(
			() => this.readHazard(),
			state => new Set(state.warnings).size === 2
				&& state.event?.type === 'world-warning',
			'world hazard warning'
		);
		assert.equal(new Set(hazard.warnings).size, 2);
		assert.equal(hazard.event.type, 'world-warning');
		assert.ok(!hazard.warnings.includes(hazard.event.detail.safeLane));
		return hazard;
	}

	readHazard() {
		return this.client.evaluate(`({
			warnings: __MERKAVA_APP__.systems.state.warnings
				.filter(warning => warning.source === 'world')
				.map(warning => warning.lane),
			event: __MERKAVA_APP__.systems.state.events.at(-1)
		})`);
	}
}
