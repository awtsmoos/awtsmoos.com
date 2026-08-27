//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Parallel refresh law for Shared Worlds without render-time polling.
 * @description
 * The Awtsmoos reveals devices, invitations, relationships, and protocol powers at
 * one instant; Awtsmoos.com gathers independent reads in parallel, then probes only
 * a bounded set of consented presence links and one selected inbox in rhyme.
 */
import * as Client from "../../../remote/deviceProtocolClient.js";
import { ownedProtocolDevices } from "./devices.js";

const MAX_PRESENCE_PROBES = 12;

export async function refreshSharedWorlds(state, signal) {
	const [devices, capabilities, invitations, relationships] = await Promise.all([
		Client.devices({ signal }),
		Client.capabilities({ signal }),
		Client.invitations({ signal }),
		Client.relationships({ signal })
	]);
	const failure = firstFailure([devices, capabilities, invitations, relationships]);
	if (failure) {
		throw new Error(failure.message || failure.error || "Shared Worlds refresh failed.");
	}
	state.devices = ownedProtocolDevices(devices);
	state.capabilities = capabilities.capabilities || [];
	state.incoming = invitations.incoming || [];
	state.outgoing = invitations.outgoing || [];
	state.relationships = relationships.relationships || [];
	if (!state.devices.some(device => device.deviceId === state.inboxDeviceId)) {
		state.inboxDeviceId = state.devices[0]?.deviceId || "awtsmoos-virtual-os";
	}
	const [presence, inbox] = await Promise.all([
		loadPresence(state.relationships, signal),
		Client.messages(state.inboxDeviceId, { signal })
	]);
	state.presence = presence;
	state.messages = inbox.ok === false ? [] : inbox.messages || [];
}

async function loadPresence(relationships, signal) {
	const candidates = relationships
		.filter(item => !item.revokedAt && item.capabilities?.includes("device.presence.read"))
		.slice(0, MAX_PRESENCE_PROBES);
	const values = await Promise.all(candidates.map(async relationship => {
		const response = await Client.presence(relationship.relationshipId, { signal });
		return [relationship.relationshipId, response.ok ? response.presence : null];
	}));
	return Object.fromEntries(values.filter(([, value]) => value));
}

function firstFailure(values) {
	return values.find(value => value?.ok === false);
}
