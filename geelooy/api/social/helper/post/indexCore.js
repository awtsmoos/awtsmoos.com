//B"H
//Blessed is He
//Boruch Hashem
/**
 * Low-level post read helpers (relocated verbatim from post/index.js).
 */
const { er } = require("../general.js");

async function get(pth, $i, withOpts=true) {
	var opts = {};
	opts.max = true;
	try {
		return {
			success: await $i.db.get(
				pth, 
				{
					max: true
				}
				//withOpts ? opts : undefined
 			)
		}
	} catch(e) {
		return er({

			stack: e.stack
		})
	}
}
// B"H 2026-10-12 (FRONT-1 api-audit): $i.db.get on a directory path does
// NOT return an array — it returns an object keyed by child name (or
// null), while $i.db.getObjectKeys returns the child-name array. The
// postsMade routes treated any non-array as empty, so alias->post links
// always resolved to {"success":[]} even when the backlinks existed.
// Normalize every directory listing to a key array before iterating.
// got is the UNWRAPPED value (may be null): arrays pass through, objects
// yield their keys, otherwise we fall back to getObjectKeys.
async function dirKeys($i, pth, got) {
	var g = got;
	if (Array.isArray(g)) return g;
	if (g && typeof g === 'object') {
		var ks = Object.keys(g);
		if (ks.length) return ks;
	}
	try {
		var listed = await $i.db.getObjectKeys(pth);
		if (Array.isArray(listed)) return listed;
	} catch (_) { /* fall through to empty */ }
	return [];
}

module.exports = {
	get,
	dirKeys,
};
