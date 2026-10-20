//B"H
//Blessed is He
//Boruch Hashem

/** @module ProcessOnePost
 * Per-post pipeline orchestrator: validate then write. Thin on purpose;
 * the two phases live in their own modules for readability.
 */

const { processOneValidate } = require('./processOneValidate.js');
const { processOneWrite } = require('./processOneWrite.js');

async function processOnePost(ctx, n) {
	const vd = await processOneValidate(ctx, n);
	if (!vd) return;
	await processOneWrite(ctx, vd);
}

module.exports = { processOnePost };
