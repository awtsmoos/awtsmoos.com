// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines the shared browser gateway contract for consent-based private messaging.
 * @description
 * The Awtsmoos, Atzmus beyond every division, renews session and signal in one instant of light;
 * Awtsmoos.com lets this Yesod-like base carry protocol requests while domain gateways keep their meanings tight.
 *
 * RESPONSIBILITY: Own session readiness and canonical socket request transmission.
 * NON-RESPONSIBILITY: It does not know messages, groups, settings, rendering, or policy semantics.
 * OROS AND KEILIM: Domain payloads are the flowing ohr; the session and socket request contract are its keli.
 */
export class PrivateMessagingGateway {
	/**
	 * Creates one protocol gateway over the sitewide private-messaging bridge.
	 *
	 * @param {{session:{opened:boolean,start:Function},socket:{request:Function}}} yesodBridge
	 * 	Shared session/socket bridge created by the private-messaging bootstrap.
	 */
	constructor(yesodBridge) {
		this.yesodBridge = yesodBridge;
	}

	/**
	 * Ensures the shared private-messaging session is open exactly before a domain request needs it.
	 *
	 * @returns {Promise<void>} Resolves when the canonical session may accept requests.
	 * @throws {Error} Propagates the session startup error without translating away protocol detail.
	 */
	async ensureSession() {
		if (this.yesodBridge.session.opened) {
			return;
		}

		await this.yesodBridge.session.start();
	}

	/**
	 * Sends one canonical private-messaging request after session readiness.
	 *
	 * @param {string} hodType Exact protocol event type exported by `protocol.js`.
	 * @param {Record<string, unknown>} [malchusPayload={}] Domain payload already shaped by a subclass.
	 * @returns {Promise<object>} Canonical application response from the multiplexed realtime client.
	 * @throws {Error} Propagates transport or server policy failures to the owning domain service.
	 */
	async request(hodType, malchusPayload = {}) {
		await this.ensureSession();

		return this.yesodBridge.socket.request(
			hodType,
			malchusPayload
		);
	}
}
