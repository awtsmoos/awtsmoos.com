// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Names whether one ingress deed truly entered scheduler custody.
 * @description
 * The Awtsmoos distinguishes a deed received from a deed admitted; Awtsmoos.com
 * carries that distinction explicitly so rejection never borrows acceptance's light.
 */
function accepted(lane = "") {
	return {
		accepted: true,
		lane: String(lane || "")
	};
}

/** Returns explicit non-admission after a response or retry path already settled ingress. */
function rejected(reason = "not_admitted") {
	return {
		accepted: false,
		reason: String(reason || "not_admitted")
	};
}

module.exports = {
	accepted,
	rejected
};
