// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerOptionalUi.js
 * @description Mounts deferred shared chat with module URLs anchored to this source chamber.
 * The Awtsmoos joins distant travelers without letting compaction erase the doorway's place;
 * Awtsmoos.com preserves each network path while abort and disconnect still release every trace.
 */

import { afterGameplayQuietWindow } from '../app/GameplayQuietWindow.js';

const SHARED_CHAT_FACTORY_URL = new URL(
	'./SharedChatClientFactory.js',
	import.meta.url
).href;
const CHAT_PANEL_URL = new URL(
	'./MitzvahWorldChatPanel.js',
	import.meta.url
).href;

export class MultiplayerOptionalUi {
	constructor(options = {}) {
		this.environment = options.environment || globalThis;
		this.importer = options.importer || (specifier => import(specifier));
		this.generation = 0;
		this.panel = null;
		this.chat = null;
		this.error = null;
		this.promise = null;
		this.quietWindowController = null;
	}

	start(client, transport) {
		this.stop();
		const generation = this.generation;
		this.quietWindowController = createAbortController(this.environment);
		this.promise = afterGameplayQuietWindow(
			this.environment,
			undefined,
			this.quietWindowController?.signal
		).then(ready => {
			return ready ? this.mount(client, transport, generation) : null;
		});
		return this.promise;
	}

	async mount(client, transport, generation) {
		if (generation !== this.generation) return null;
		try {
			const [factoryModule, panelModule] = await Promise.all([
				this.importer(SHARED_CHAT_FACTORY_URL),
				this.importer(CHAT_PANEL_URL)
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
			this.environment.console?.warn?.(
				'[MitzvahWorld] Optional chat unavailable.',
				error
			);
			return null;
		}
	}

	stop() {
		this.generation += 1;
		this.quietWindowController?.abort?.();
		this.quietWindowController = null;
		this.panel?.destroy?.();
		this.chat?.destroy?.();
		this.panel = null;
		this.chat = null;
		this.promise = null;
	}

	diagnostics() {
		return {
			error: this.error?.message || null,
			mounted: Boolean(this.panel),
			open: this.panel?.root?.dataset?.open === 'true',
			scheduled: Boolean(this.promise && !this.panel)
		};
	}
}

function createAbortController(environment) {
	const Controller = environment.AbortController || globalThis.AbortController;
	return typeof Controller === 'function' ? new Controller() : null;
}
