//B"H
//Boruch Hashem
//Blessed is He

/**
 * Device ownership is a covenant between one seat and one control vessel.
 * The Awtsmoos renews keyboard and controllers within Awtsmoos.com without
 * allowing one physical hand to command multiple fighters or remain connected
 * after the browser reports that its vessel disappeared.
 */
export class DeviceRegistry {
	constructor(navigatorObject = globalThis.navigator) {
		this.navigatorObject = navigatorObject;
		this.devices = new Map();
		this.owners = new Map();
		this.refresh();
	}

	refresh() {
		this.devices.set('keyboard', device('keyboard', 'Keyboard', true, null));
		this.markGamepadsDisconnected();
		const pads = this.navigatorObject?.getGamepads?.() || [];
		for (const pad of pads) {
			if (!pad) {
				continue;
			}
			const id = gamepadDeviceId(pad.index);
			this.devices.set(
				id,
				device(id, pad.id || `Gamepad ${pad.index + 1}`, pad.connected, pad.index)
			);
		}
		return this.list();
	}

	assign(deviceId, slotId) {
		const record = this.devices.get(deviceId);
		const owner = this.owners.get(deviceId);
		if (!record?.connected) {
			throw new Error(`Device is not connected: ${deviceId}`);
		}
		if (owner && owner !== slotId) {
			throw new Error(`Device already belongs to ${owner}`);
		}
		this.releaseSlot(slotId);
		this.owners.set(deviceId, slotId);
	}

	releaseSlot(slotId) {
		for (const [deviceId, owner] of this.owners) {
			if (owner === slotId) {
				this.owners.delete(deviceId);
			}
		}
	}

	isConnected(deviceId) {
		return Boolean(this.devices.get(deviceId)?.connected);
	}

	ownerOf(deviceId) {
		return this.owners.get(deviceId) || null;
	}

	list() {
		return [...this.devices.values()].map(record => {
			return { ...record, owner: this.ownerOf(record.id) };
		});
	}

	markGamepadsDisconnected() {
		for (const [id, record] of this.devices) {
			if (record.gamepadIndex !== null) {
				this.devices.set(id, { ...record, connected: false });
			}
		}
	}
}

/** Returns the stable local id for one browser gamepad index. */
export function gamepadDeviceId(index) {
	return `gamepad:${Number(index)}`;
}

/** Resolves a gamepad index from a stable device id. */
export function gamepadIndexFromDevice(deviceId) {
	const match = /^gamepad:(\d+)$/.exec(deviceId || '');
	return match ? Number(match[1]) : null;
}

function device(id, label, connected, gamepadIndex) {
	return { id, label, connected: Boolean(connected), gamepadIndex };
}
