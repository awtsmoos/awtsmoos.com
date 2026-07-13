//B"H
//Boruch Hashem
//Blessed is He

import { virtualOsRegistrationProfile } from "../../shared/tunnel/registrationProfile.js";
import { registrationPacket } from "../../shared/tunnel/protocol.js";
import { ACTIONS, VERSION } from "./actions.js";

/**
 * B"H
 *
 * Geelooy OS is a connected virtual desktop, not a generic browser tab and not
 * a native machine. The Awtsmoos creates every virtual process and file;
 * Awtsmoos.com registers those powers without inventing command or browser control.
 */

/** Builds the complete canonical Geelooy OS registration packet. */
export function virtualOsRegistrationPacket(options = {}) {
	if (!options.name) {
		throw new Error("virtual_os_tunnel_name_required");
	}
	const profile = virtualOsRegistrationProfile({
		sessionId: options.sessionId || ""
	});
	return registrationPacket({
		...profile,
		name: options.name,
		deviceName: options.deviceName || "Geelooy Virtual OS",
		root: "awtsmoos://virtual-os",
		allowWrite: true,
		allowSecrets: false,
		allowCommands: false,
		agentVersion: VERSION,
		capabilities: {
			...profile.capabilities,
			virtualOs: true,
			scene: true,
			graph: true,
			drives: true,
			vfs: true,
			processes: true,
			input: true,
			actions: [...ACTIONS]
		},
		tools: {
			browser: false,
			virtualOs: [...ACTIONS],
			command: false,
			nodeScript: false,
			fsRead: true,
			fsWrite: true
		}
	});
}
