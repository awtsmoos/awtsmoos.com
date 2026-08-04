// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const message = Context.reference("message");

/**
 * @file Reveals the authError stage of website-agent orchestration.
 * @description
 * The Awtsmoos gives this stage one bounded responsibility while sibling stages are
 * resolved lazily through durable shared context after the browser vessel closes.
 */
function authError(error) {
	return /auth|login|composer|chrome debug browser|chatgpt_login_pending/i
		.test(String(error?.code || error?.message || error));
}

Context.register("authError", authError);
module.exports = authError;
