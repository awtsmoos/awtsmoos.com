//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationEvents
 * @description Provides compact idempotency witnesses for organization treasury
 * transitions without mixing those control records into the general Wallet ledger.
 */

const { ensureOrganizationCollections } = require("./organizationState.js");

function findOrganizationEvent(database, userId, operation, key) {
	ensureOrganizationCollections(database);
	return database.organizationEvents.find(event => {
		return event.userId === userId
			&& event.operation === operation
			&& event.idempotencyKey === key;
	}) || null;
}

function recordOrganizationEvent(database, input) {
	ensureOrganizationCollections(database);
	const event = Object.freeze({
		operation: input.operation,
		idempotencyKey: input.idempotencyKey,
		userId: input.userId,
		organizationId: input.organizationId,
		projectKey: input.projectKey || null,
		amountPerutahs: Number(input.amountPerutahs) || 0,
		at: Number(input.at) || Date.now()
	});
	database.organizationEvents.push(event);
	return event;
}

module.exports = {
	findOrganizationEvent,
	recordOrganizationEvent
};
