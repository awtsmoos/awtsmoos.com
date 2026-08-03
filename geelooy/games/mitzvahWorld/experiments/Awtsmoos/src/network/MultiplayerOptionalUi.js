// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MultiplayerOptionalUi.js
 * @description Mounts folded chat dependencies immediately or after one abortable server quiet window.
 * The Awtsmoos joins nearby tabs without scattering source scrolls across the road;
 * Awtsmoos.com preserves delay, injection, cancellation, disconnect, diagnostics, and exact cleanup.
 */

import { afterGameplayQuietWindow } from '../app/GameplayQuietWindow.js';
import { MitzvahWorldChatPanel } from './MitzvahWorldChatPanel.js';
import { createSharedChatClient } from './SharedChatClientFactory.js';

const OPTIONAL_CHAT_DELAY_MS = 2500;
const SHARED_CHAT_FACTORY_URL = new URL('./SharedChatClientFactory.js', import.meta.url).href;
const CHAT_PANEL_URL = new URL('./MitzvahWorldChatPanel.js', import.meta.url).href;

export class MultiplayerOptionalUi {
	constructor(options = {}) {
		this.environment = options.environment || globalThis;
		this.importer = options.importer || null;
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
		if (transport === 'local-tab') {
			this.promise = this.mount(client, transport, generation);
			return this.promise;
		}
		this.quietWindowController = createAbortController(this.environment);
		this.promise = afterGameplayQuietWindow(
			this.environment,
			OPTIONAL_CHAT_DELAY_MS,
			this.quietWindowController?.signal
		).then(ready => ready ? this.mount(client, transport, generation) : null);
		return this.promise;
	}

	async mount(client, transport, generation) {
		if (generation !== this.generation) return null;
		try {
			const modules = await resolveChatModules(this.importer);
			const chat = modules.createSharedChatClient(client, transport);
			if (!chat || generation !== this.generation) {
				chat?.destroy?.();
				return null;
			}
			const panel = new modules.MitzvahWorldChatPanel(chat.client, {
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
			delayMilliseconds: OPTIONAL_CHAT_DELAY_MS,
			error: this.error?.message || null,
			mounted: Boolean(this.panel),
			open: this.panel?.root?.dataset?.open === 'true',
			scheduled: Boolean(this.promise && !this.panel)
		};
	}
}

async function resolveChatModules(importer) {
	if (!importer) return { MitzvahWorldChatPanel, createSharedChatClient };
	const [factoryModule, panelModule] = await Promise.all([
		importer(SHARED_CHAT_FACTORY_URL),
		importer(CHAT_PANEL_URL)
	]);
	return {
		MitzvahWorldChatPanel: panelModule.MitzvahWorldChatPanel,
		createSharedChatClient: factoryModule.createSharedChatClient
	};
}

function createAbortController(environment) {
	const Controller = environment.AbortController || globalThis.AbortController;
	return typeof Controller === 'function' ? new Controller() : null;
}
