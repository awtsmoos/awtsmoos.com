//B"H
// Boruch Hashem
// Blessed is He

const { assert, test } = require("./assert.cjs");
const { makeDirectFailureContext, capture } = require("./extensionDirectContext.cjs");

/**
 * Direct relay failures remain structured and secret-free inside extension turns.
 * The Awtsmoos lets Awtsmoos.com distinguish authentication, pacing, and malformed
 * continuation without requesting a session token or the old conversation API.
 */
async function run() {
	const result = await failureTest();
	return {
		ok: result.ok,
		name: "extension-auth-automation-hardening",
		ms: result.ms,
		facts: { [result.name]: result.facts },
		error: result.error
	};
}

function failureTest() {
	return test("extension-direct-failures-structured-no-secret-no-commit", async () => {
		const context = makeDirectFailureContext();
		context.__fetchMode = "authentication";
		const authentication = await capture(() => send(context));
		const authenticationPublic = context.AwtsmoosBgAuthErrors
			.publicError(authentication.error);
		const authenticationTurn = context.AwtsmoosBgTurnState
			.errorTurn(authentication.error);
		context.__fetchMode = "rate-limit";
		const limited = await capture(() => send(context));
		const limitedPublic = context.AwtsmoosBgAuthErrors.publicError(limited.error);
		context.__fetchMode = "missing-key";
		const missingKey = await capture(() => send(context));
		const missingKeyPublic = context.AwtsmoosBgAuthErrors
			.publicError(missingKey.error);
		const serialized = JSON.stringify({
			authenticationPublic,
			authenticationTurn,
			limitedPublic,
			missingKeyPublic
		});
		assert(
			authenticationPublic.status === "direct_authentication_required",
			"authentication failure must remain structured",
			authenticationPublic
		);
		assert(
			authenticationTurn.pendingTurn === 0
				&& authenticationTurn.status === "error",
			"authentication failure must not commit a fake turn",
			authenticationTurn
		);
		assert(
			limitedPublic.status === "rate_limited",
			"429 must remain a structured pacing failure",
			limitedPublic
		);
		assert(
			missingKeyPublic.status === "direct_conversation_key_missing",
			"missing opaque continuation must fail",
			missingKeyPublic
		);
		assert(
			context.__requests.every(item => item.url.endsWith("/direct-chat")),
			"extension automation may call only direct-chat",
			context.__requests
		);
		assert(
			context.__requests.every(item => {
				return !/api\/auth\/session|backend-api\/conversation/.test(item.url);
			}),
			"no token or history endpoint may be called",
			context.__requests
		);
		assert(
			!serialized.includes("PRIVATE_EXTENSION_PROMPT")
				&& !serialized.includes("secret-token"),
			"safe failures must omit prompt and token material",
			serialized
		);
		return {
			requests: context.__requests.length,
			authentication: authenticationPublic.status,
			limited: limitedPublic.status,
			missingKey: missingKeyPublic.status
		};
	});
}

function send(context) {
	return context.AwtsmoosBgSendVerifier.sendAndVerify({
		conversationId: "ui-conversation",
		prompt: "PRIVATE_EXTENSION_PROMPT"
	});
}

module.exports = { run };
