//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * Many applications may shine through one real-time doorway without becoming
 * one tangled creature. The Awtsmoos renews every light; this Awtsmoos.com
 * registry guards each application's name, versions, and legacy inheritance.
 */

const { RealtimeError } = require("./RealtimeError.js");
const APPLICATION_ID_PATTERN = /^[a-z][a-z0-9-]{1,63}$/;

/** Owns unique application definitions and legacy message-type claims. */
class ApplicationRegistry {
	constructor() {
		this.applications = new Map();
		this.legacyOwners = new Map();
	}

	/** Registers one complete application definition atomically. */
	register(definition) {
		validateDefinition(definition);
		const normalized = normalizeDefinition(definition);
		this.requireAvailableApplication(normalized.id);
		this.requireAvailableLegacyTypes(normalized.legacyTypes);

		for (const messageType of normalized.legacyTypes) {
			this.legacyOwners.set(messageType, normalized.id);
		}
		this.applications.set(normalized.id, normalized);
		return normalized;
	}

	/** Resolves one application only when its requested version is supported. */
	resolve(applicationId, version) {
		const application = this.applications.get(applicationId);
		if (!application) {
			throw new RealtimeError(
				"UNKNOWN_APPLICATION",
				`Unknown real-time application: ${applicationId}`
			);
		}
		if (!application.versions.has(version)) {
			throw new RealtimeError(
				"UNSUPPORTED_VERSION",
				`Application ${applicationId} does not support protocol version ${version}.`,
				{ supportedVersions: [...application.versions] }
			);
		}
		return application;
	}

	resolveLegacy(messageType) {
		const applicationId = this.legacyOwners.get(messageType);
		return applicationId ? this.applications.get(applicationId) : null;
	}

	list() {
		return [...this.applications.values()].map(application => ({
			id: application.id,
			versions: [...application.versions]
		}));
	}

	requireAvailableApplication(applicationId) {
		if (this.applications.has(applicationId)) {
			throw new Error(`Realtime application already registered: ${applicationId}`);
		}
	}

	requireAvailableLegacyTypes(messageTypes) {
		for (const messageType of messageTypes) {
			if (this.legacyOwners.has(messageType)) {
				throw new Error(`Legacy message type already registered: ${messageType}`);
			}
		}
	}
}

function validateDefinition(definition) {
	if (!definition || !APPLICATION_ID_PATTERN.test(definition.id || "")) {
		throw new Error("Realtime application requires a stable lowercase id.");
	}
	if (!Array.isArray(definition.versions) || definition.versions.length === 0) {
		throw new Error(`Realtime application ${definition.id} requires versions.`);
	}
}

function normalizeDefinition(definition) {
	return Object.freeze({
		...definition,
		legacyTypes: Object.freeze([...(definition.legacyTypes || [])]),
		versions: new Set(definition.versions.map(Number))
	});
}

module.exports = {
	APPLICATION_ID_PATTERN,
	ApplicationRegistry
};
