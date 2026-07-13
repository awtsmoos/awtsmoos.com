//B"H
// Boruch Hashem
// Blessed is He
/**
 * Boss entrance, phases, reward, blessing, and world passage receive browser proof.
 * The Awtsmoos is beyond opposition while Awtsmoos.com reveals the finite battle.
 */
import assert from 'node:assert/strict';

export class BrowserBossDriver {
	constructor(client, campaign) {
		this.client = client;
		this.campaign = campaign;
	}

	async verifyAndAdvance() {
		await this.prepareLevel();
		await this.campaign.advanceLevel();
		let state = await this.campaign.waitForSnapshot(
			value => value.boss?.name === 'Prince of Dust',
			'Prince of Dust entrance'
		);
		assert.equal(state.boss.name, 'Prince of Dust');
		await this.refreshHud();
		const visible = await this.client.evaluate(
			"!bossHud.classList.contains('hidden')"
		);
		assert.equal(visible, true);
		const phaseEvidence = await this.setRageHealth();
		assert.ok(
			phaseEvidence.phase >= 3,
			`Boss phase evidence: ${JSON.stringify(phaseEvidence)}`
		);
		await this.client.evaluate(
			'window.__MERKAVA_DIAGNOSTICS__.defeatBoss()'
		);
		const choice = await this.campaign.waitForChoice(
			isMajorBlessingReady,
			'major boss blessing'
		);
		assert.equal(choice.mode, 'major-blessing');
		await this.campaign.clickChoice(0);
		state = await this.campaign.waitForSnapshot(
			value => value.world === 2 && value.level === 1,
			'world two entrance'
		);
		return state;
	}

	async prepareLevel() {
		await this.client.evaluate(`(() => {
			const systems = __MERKAVA_APP__.systems;
			const state = systems.state;
			systems.campaign.clearLaneState(state);
			state.shots.length = 0;
			state.blessing = 0;
			state.blessingFragments = 0;
			state.transitionRequest = null;
			state.pendingAdvance = false;
			state.paused = false;
			__MERKAVA_DIAGNOSTICS__.setLevel(4);
		})()`);
	}

	refreshHud() {
		return this.client.evaluate(`__MERKAVA_APP__.hud.update(
			__MERKAVA_APP__.systems.state,
			__MERKAVA_APP__.systems.save
		)`);
	}

	setRageHealth() {
		return this.client.evaluate(`(() => {
			const systems = __MERKAVA_APP__.systems;
			const boss = systems.state.boss;
			boss.health = boss.maxHealth * 0.3;
			systems.boss.update(systems.state, 0);
			__MERKAVA_APP__.hud.update(systems.state, systems.save);
			return {
				health: boss.health,
				maximum: boss.maxHealth,
				thresholds: boss.thresholds,
				phase: boss.phase,
				hud: bossPhase.textContent
			};
		})()`);
	}
}

function isMajorBlessingReady(value) {
	return value.mode === 'major-blessing'
		&& /MAJOR SEFIRAH/.test(value.title)
		&& value.choices > 0;
}
