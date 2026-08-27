//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveDomainClaimIdentity
 * @description
 * The Awtsmoos gives every claim a server-born secret witness and every global
 * reservation a unique audit identity. Awtsmoos.com never asks browser code to mint
 * the evidence by which that same browser claims authority.
 */

const crypto = require('crypto');

function reservationFor(aliasId, record, createdAt) {
	return {
		version: 1,
		hostname: record.hostname,
		aliasId,
		siteId: record.siteId,
		claimId: crypto.randomUUID(),
		createdAt
	};
}

function verificationToken(factory) {
	return factory ? factory() : crypto.randomBytes(24).toString('base64url');
}

module.exports = {
	reservationFor,
	verificationToken
};
