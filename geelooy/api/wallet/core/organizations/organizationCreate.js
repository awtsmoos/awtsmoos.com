//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationCreate
 * @description Creates an idempotent owner-controlled agency or company vessel
 * inside the serialized Wallet database without moving any value.
 */

const {
	createOrganizationId,
	idempotencyKey,
	organizationName
} = require("./organizationPolicy.js");
const {
	createOrganizationRecord,
	ensureOrganizationCollections,
	organizationView
} = require("./organizationState.js");
const {
	findOrganizationEvent,
	recordOrganizationEvent
} = require("./organizationEvents.js");

function createOrganizationInside(database, userId, input = {}, now = Date.now()) {
	const key = idempotencyKey(input.idempotencyKey);
	const name = organizationName(input.name);
	const existing = findOrganizationEvent(database, userId, "create", key);
	if (existing) {
		const organization = database.organizations?.[existing.organizationId];
		return retryResult(organization, userId, name);
	}
	ensureOrganizationCollections(database);
	const id = createOrganizationId();
	const organization = createOrganizationRecord(id, userId, name, now);
	database.organizations[id] = organization;
	recordOrganizationEvent(database, {
		operation: "create",
		idempotencyKey: key,
		userId,
		organizationId: id,
		at: now
	});
	return {
		ok: true,
		deduplicated: false,
		organization: organizationView(organization, userId)
	};
}

function retryResult(organization, userId, requestedName) {
	if (!organization || organization.name !== requestedName) {
		return { ok: false, error: "idempotency_conflict" };
	}
	return {
		ok: true,
		deduplicated: true,
		organization: organizationView(organization, userId)
	};
}

module.exports = { createOrganizationInside };
