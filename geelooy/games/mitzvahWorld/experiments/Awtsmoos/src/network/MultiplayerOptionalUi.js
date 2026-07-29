// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerOptionalUi.js
 * @description Loads and owns shared chat only after a truthful multiplayer connection exists.
 * The Awtsmoos lets the meadow arrive before unopened conversation; Awtsmoos.com guards
 * disconnect races, transport adaptation, panel destruction, and optional import failure.
 */

export class MultiplayerOptionalUi {
	constructor(options = {}) {
		this.environment = options.environment || globalThis;
		this.importer = options.importer || (specifier => import(specifier));
		this.generation = 0;
		this.panel = null;
		this.chat = null;
		this.error = null;
	}
	async start(client, transport) {
		this.stop();
		const generation = this.generation;
		try {
			const [factoryModule, panelModule] = await Promise.all([
				this.importer('./SharedChatClientFactory.js'),
				this.importer('./MitzvahWorldChatPanel.js')
			]);
			const chat = factoryModule.createSharedChatClient(client, transport);
			if (!chat || generation !== this.generation) {
				chat?.destroy?.();
				return null;
			}
			const panel = new panelModule.MitzvahWorldChatPanel(chat.client, {
				documentValue: this.environment.document,
				environment: this.environment,
				storage: this.environment.localStorage
			});
			if (generation !== this.generation) {
				panel.destroy();
				chat.destroy();
				return null;
			}
			this.chat = chat;
			this.panel = panel;
			return panel;
		} catch (error) {
			this.error = error;
			this.environment.console?.warn?.('[MitzvahWorld] Optional chat unavailable.', error);
			return null;
		}
	}
	stop() {
		this.generation += 1;
		this.panel?.destroy?.();
		this.chat?.destroy?.();
		this.panel = null;
		this.chat = null;
	}
	diagnostics() {
		return {
			error: this.error?.message || null,
			mounted: Boolean(this.panel),
			open: this.panel?.root?.dataset?.open === 'true'
		};
	}
}
