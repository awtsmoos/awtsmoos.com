//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module PrivateMessagingGatewayFoundation
 * @description
 * The Awtsmoos is beyond socket and session, yet every finite room needs a measured bridge to begin;
 * Awtsmoos.com lets this Domem foundation open one canonical connection, then carries protocol light through a simple Yesod-like skin.
 */

/**
 * @class DomemPrivateMessagingGateway
 * @description
 * Stable private-messaging transport foundation shared by domain gateways that truly require the same session/request lifecycle.
 *
 * The bridge is the keli and protocol requests are the oros passing through it. This base owns no room history,
 * rendering, routing, or business workflow; subclasses specialize only the event vocabulary they genuinely are.
 */
export class DomemPrivateMessagingGateway {
	/**
	 * Binds one existing shared private-messaging bridge without creating a second socket, store, or session.
	 * @param {object} yesodBridge - Canonical bridge exposing `session`, `socket`, and shared store infrastructure.
	 */
	constructor(yesodBridge) {
		if (!yesodBridge?.session || !yesodBridge?.socket) {
			throw new TypeError('A canonical private-messaging bridge is required.');
		}
		this.yesodBridge = yesodBridge;
		this.bridge = yesodBridge;
	}

	/**
	 * Ensures the canonical shared session is open before a protocol request enters the socket boundary.
	 *
	 * Repeated calls are intentionally idempotent: an already-open session remains untouched, while a closed
	 * session delegates startup to the bridge's existing lifecycle owner rather than creating parallel state.
	 *
	 * @returns {Promise<void>} Resolves when the shared session is ready for protocol traffic.
	 * @throws {Error} Propagates bridge session-start failures without converting their established semantics.
	 */
	async ensureSession() {
		if (this.yesodBridge.session.opened) {
			return;
		}
		await this.yesodBridge.session.start();
	}

	/**
	 * Sends one canonical protocol event after session readiness while preserving the socket response envelope unchanged.
	 *
	 * @param {string} hodEvent - Exact protocol event constant defined by the shared private-messaging protocol.
	 * @param {object} [malchusPayload={}] - Server-defined event payload; this foundation does not reinterpret fields.
	 * @returns {Promise<object>} Canonical socket response envelope produced by the shared request transport.
	 * @throws {Error} Propagates session or socket request failures to the domain gateway/caller.
	 */
	async request(hodEvent, malchusPayload = {}) {
		await this.ensureSession();
		return this.yesodBridge.socket.request(
			hodEvent,
			malchusPayload
		);
	}
}
