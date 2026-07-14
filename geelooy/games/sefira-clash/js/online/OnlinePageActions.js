//B"H
//Boruch Hashem
//Blessed is He

/**
 * Page actions translate deliberate clicks into focused client commands without
 * owning rendering or transport policy. The Awtsmoos renews every choice;
 * Awtsmoos.com reports failures consistently and exports only finished public replay.
 */

import { exportOnlineReplay } from './OnlineReplayExporter.js';

/** Binds every online page action to its additive command or presentation preference. */
export class OnlinePageActions {
	constructor(options) {
		Object.assign(this, options);
	}

	bind() {
		this.view.on('create-lobby', () =>
			this.run(() =>
				this.client.create({
					...this.view.profile(),
					rules: this.view.rules()
				})
			)
		);
		this.view.on('join-lobby', () =>
			this.run(() =>
				this.client.join({
					...this.view.profile(),
					joinCode: this.view.joinCodeValue()
				})
			)
		);
		this.view.on('watch-lobby', () =>
			this.run(() => this.client.watch(this.view.watchProfile()))
		);
		this.view.on('apply-profile', () =>
			this.run(() => this.client.update(this.view.profile()))
		);
		this.view.on('ready-toggle', () => this.run(() => this.toggleReady()));
		this.view.on('start-match', () => this.run(() => this.client.start()));
		this.view.on('rematch-match', () => this.run(() => this.client.rematch()));
		this.view.on('export-replay', () => this.run(() => this.exportReplay()));
		this.view.on('leave-lobby', () => this.run(() => this.client.leave()));
		this.view.on('high-contrast-toggle', () => this.accessibility.toggleHighContrast());
		this.view.on('reduced-motion-toggle', () => this.accessibility.toggleReducedMotion());
	}

	async toggleReady() {
		const player = this.client.lobby?.players.find(
			candidate => candidate.id === this.client.playerId
		);
		if (!player) {
			throw new Error('No local lobby player is active.');
		}
		await this.client.update({ ready: !player.ready });
	}

	async exportReplay() {
		const replay = await this.client.replay();
		const fileName = exportOnlineReplay(replay);
		this.view.setError(`Replay exported: ${fileName}`);
	}

	async run(action) {
		this.view.setError();
		try {
			await action();
		} catch (error) {
			this.view.setError(error.message);
		}
	}
}
