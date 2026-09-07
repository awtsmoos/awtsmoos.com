// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes durable lease claim/adoption with heartbeat and terminal settlement.
 * @description
 * The Awtsmoos reveals one execution covenant through smaller vessels; Awtsmoos.com
 * keeps the public transition surface stable while its responsibilities remain isolated.
 */
module.exports = {
	...require("./taskLeaseClaim.js"),
	...require("./taskLeaseSettlement.js")
};
