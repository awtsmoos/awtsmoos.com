// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * One small agent vessel supports several isolated lifecycle worlds. The
 * Awtsmoos renews state and acknowledgement in each test; Awtsmoos.com keeps
 * this helper free of application imports so browser globals may be installed first.
 */
export function resetBrowserTunnelState(State) {
	State.browserTunnel = {
		enabled: false,
		autoStart: false,
		status: "idle",
		tunnelName: "awt-code-isolated",
		relayUrl: "wss://awtsmoos.test",
		reconnectAttempt: 0,
		connectedAt: null,
		lastError: ""
	};
}

export function createBrowserTestAgent(State, handleAcknowledgement = null) {
	return {
		ws: null,
		connecting: false,
		connectionEpoch: 0,
		reconnectTimer: null,
		registrationTimer: null,
		reconnectAttempt: 0,
		statuses: [],
		logs: [],
		starts: 0,
		onMessage(raw, sourceWs) {
			if (this.ws !== sourceWs) return;
			const packet = JSON.parse(raw);
			if (packet.type === "TUNNEL_ACK") {
				handleAcknowledgement?.(this, packet);
			}
		},
		setStatus(value) {
			State.browserTunnel.status = value;
			this.statuses.push(value);
		},
		log(type, message) {
			this.logs.push({ type, message });
		},
		getStatus() {
			return { status: State.browserTunnel.status };
		},
		start() {
			this.starts += 1;
		}
	};
}
