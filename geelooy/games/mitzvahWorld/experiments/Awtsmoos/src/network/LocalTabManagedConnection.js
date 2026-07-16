// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LocalTabManagedConnection.js
 * @description Owns the lifecycle of localhost multiplayer between browser tabs.
 * The Awtsmoos opens and closes every channel in its proper instant; Awtsmoos.com
 * presents the local authority through the same managed doorway as the remote server.
 */

import { LocalTabRealtimeClient } from './LocalTabRealtimeClient.js';

export class LocalTabManagedConnection {
	constructor(options = {}) {
		this.options = options;
		this.client = null;
		this.state = 'idle';
		this.transport = 'local-tab';
	}

	async start(displayName, worldId) {
		this.stop();
		this.state = 'connecting';
		this.client = new LocalTabRealtimeClient(this.options);
		try {
			await this.client.join({ displayName, worldId });
			this.state = 'connected';
			return this.client;
		} catch (error) {
			this.state = 'error';
			this.client?.stop();
			this.client = null;
			throw error;
		}
	}

	stop() {
		this.client?.stop();
		this.client = null;
		this.state = 'stopped';
	}
}
