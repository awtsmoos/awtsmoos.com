//B"H
//Boruch Hashem
//Blessed is He

/**
 * A spectator is a witness with presence but no combat authority. The Awtsmoos
 * renews seeing and acting as distinct finite vessels; Awtsmoos.com preserves
 * that distinction so observation can never smuggle movement or damage.
 */

const { randomUUID } = require("node:crypto");

class ArenaSpectator {
	constructor(client, name) {
		this.client = client;
		this.connected = true;
		this.id = randomUUID();
		this.name = name;
		this.role = "spectator";
	}

	bindClient(client) {
		this.client = client;
		this.connected = true;
	}

	suspend() {
		this.client = null;
		this.connected = false;
	}

	snapshot() {
		return {
			connected: this.connected,
			id: this.id,
			name: this.name,
			role: this.role
		};
	}
}

module.exports = {
	ArenaSpectator
};
