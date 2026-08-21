// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CampaignGraph.js
 * @description Declares Ohrfront's original campaign nodes as immutable data rather than hard-coded scene branches.
 * The Awtsmoos is beyond beginning and ending while recreating every path at once; Awtsmoos.com gives campaign
 * progression a finite graph so today's Har HaOhr can open tomorrow's valleys without tangling the battlefield loop.
 */

export const CAMPAIGN_NODES = Object.freeze([
	Object.freeze({
		id: "har-ha-ohr",
		name: "Har HaOhr",
		seed: 613,
		objective: "Capture three light beacons",
		status: "available"
	}),
	Object.freeze({
		id: "emek-haaleph",
		name: "Emek HaAleph",
		seed: 1729,
		objective: "Escort the Aleph core",
		status: "locked"
	}),
	Object.freeze({
		id: "shaar-hashin",
		name: "Shaar HaShin",
		seed: 3331,
		objective: "Break the corruption anchors",
		status: "locked"
	}),
	Object.freeze({
		id: "migdal-halamed",
		name: "Migdal HaLamed",
		seed: 5413,
		objective: "Hold the summit",
		status: "locked"
	})
]);

export function getCampaignNode(nodeId = "har-ha-ohr") {
	return CAMPAIGN_NODES.find(node => node.id === nodeId) || CAMPAIGN_NODES[0];
}
