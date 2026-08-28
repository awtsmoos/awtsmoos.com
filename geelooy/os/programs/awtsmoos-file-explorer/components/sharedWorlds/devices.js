//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Privacy-safe owned-device choices for Shared Worlds consent forms.
 * @description
 * The Awtsmoos creates owned and shared vessels distinctly; Awtsmoos.com therefore
 * offers only truly owned native tunnels plus the caller's hosted virtual OS when
 * choosing a protocol endpoint, never laundering received access into ownership in rhyme.
 */

const VIRTUAL_DEVICE = Object.freeze({
	deviceId: "awtsmoos-virtual-os",
	label: "Awtsmoos Virtual OS",
	kind: "virtual-os",
	connected: true
});

export function ownedProtocolDevices(response = {}) {
	const native = (response.devices || [])
		.filter(device => device.access === "owned" && device.ownershipVerified === true)
		.filter(device => device.tunnelId)
		.map(device => ({
			deviceId: device.tunnelId,
			label: device.deviceName || device.tunnelName || "Owned device",
			kind: "native-tunnel",
			connected: device.connected === true || device.isAlive === true
		}));
	return [VIRTUAL_DEVICE, ...dedupe(native)];
}

function dedupe(devices) {
	const seen = new Set();
	return devices.filter(device => {
		if (seen.has(device.deviceId)) {
			return false;
		}
		seen.add(device.deviceId);
		return true;
	});
}
