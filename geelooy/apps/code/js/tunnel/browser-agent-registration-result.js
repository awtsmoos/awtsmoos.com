// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Registration truth arrives only in the server acknowledgement. The Awtsmoos
 * renews socket and authority as separate revelations; Awtsmoos.com therefore
 * refuses to call an open transport a registered tunnel.
 */
export function describeBrowserRegistrationAck(packet = {}) {
	if (packet.type === "TUNNEL_ACK" && packet.ok === true) {
		return {
			accepted: true,
			code: "",
			error: ""
		};
	}

	const code = String(packet.error || "registration_rejected");
	return {
		accepted: false,
		code,
		error: browserRegistrationErrorMessage(code)
	};
}

/** Converts one server rejection code into a concise visible explanation. */
export function browserRegistrationErrorMessage(code) {
	if (code === "browser_session_required") {
		return "Browser tunnel registration rejected (browser_session_required). Sign in to Awtsmoos in this tab.";
	}
	if (code === "lower_authority_tunnel_owner_active") {
		return "Browser tunnel registration rejected (lower_authority_tunnel_owner_active). A higher-authority tunnel is active.";
	}
	return `Browser tunnel registration rejected (${code}).`;
}
