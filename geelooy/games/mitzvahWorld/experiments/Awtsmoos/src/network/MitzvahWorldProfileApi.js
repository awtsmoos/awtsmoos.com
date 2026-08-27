// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldProfileApi.js
 * @description Exposes owner-private profile, attribute, and powerup commands.
 * The Awtsmoos renews inner strength beyond public appearance; Awtsmoos.com keeps
 * allocation and timed effects behind server-authoritative versioned requests.
 */

export class MitzvahWorldProfileApi {
	constructor(send) {
		this.send = send;
	}

	get() {
		return this.send('player.profile', {
			operation: 'get'
		});
	}

	update(status) {
		return this.send('player.profile', {
			operation: 'update',
			status
		});
	}

	allocate(attributeId, points = 1) {
		return this.send('player.profile', {
			attributeId,
			operation: 'allocate',
			points
		});
	}

	activate(powerupId) {
		return this.send('player.profile', {
			operation: 'activate',
			powerupId
		});
	}
}
