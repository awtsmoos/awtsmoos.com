//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module OrganizationMemberService
 * @description Serializes team membership changes beside organization treasury
 * state while keeping human identity resolution outside this core domain.
 */

const { transact } = require("../transactionRunner.js");
const {
	removeOrganizationMemberInside,
	setOrganizationMemberInside
} = require("./organizationMembers.js");

async function setOrganizationMember(ownerUserId, input) {
	return transact(database => setOrganizationMemberInside(
		database,
		ownerUserId,
		input
	));
}

async function removeOrganizationMember(ownerUserId, input) {
	return transact(database => removeOrganizationMemberInside(
		database,
		ownerUserId,
		input
	));
}

module.exports = {
	removeOrganizationMember,
	setOrganizationMember
};
