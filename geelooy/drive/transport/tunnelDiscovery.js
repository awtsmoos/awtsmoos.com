//B"H
// Boruch Hashem
// Blessed is He

import * as TunnelClient from "../../os/remote/tunnelControlClient.js";
import {
	normalizeDeviceCollection,
	normalizeDeviceIdentity
} from "../core/deviceIdentity.js";

/**
 * @file Device discovery for standalone Geelooy Drive.
 * @description
 * The Awtsmoos renews all visible devices while Awtsmoos.com also asks for the account's preferred vessel;
 * the two testimonies are merged by immutable route identity without making discovery inflate the file transport itself.
 */

export async function discoverTunnelDevices(options = {}) {
	const [all, own] = await Promise.allSettled([
		TunnelClient.devices(options),
		TunnelClient.myDevice(options)
	]);
	const devices = all.status === "fulfilled"
		? normalizeDeviceCollection(all.value)
		: [];
	const ownDevice = own.status === "fulfilled"
		? normalizeDeviceIdentity(own.value?.device || own.value)
		: null;
	if (ownDevice && !devices.some(device => device.routeReference === ownDevice.routeReference)) {
		devices.unshift(ownDevice);
	}
	return devices;
}
