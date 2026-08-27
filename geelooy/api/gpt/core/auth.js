//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos gives each API request a known Awtsmoos.com identity before the
 * local relay may be touched. Browser ChatGPT credentials never enter this gate;
 * only the site's authenticated user and ordinary same-site origin are examined.
 */
function authorizeGptRequest($i) {
	const userId = $i?.request?.user?.info?.userId
		|| $i?.request?.user?.userId
		|| null;
	if (!userId) {
		return refusal(401, "GPT_AUTH_REQUIRED", "Sign in to Awtsmoos.com before using this route.");
	}
	const origin = String(
		$i?.request?.headers?.origin
		|| $i?.request?.headers?.referer
		|| ""
	).toLowerCase();
	if (origin && !origin.includes("awtsmoos.com") && !isLoopbackOrigin(origin)) {
		return refusal(403, "GPT_ORIGIN_FORBIDDEN", "The GPT route accepts Awtsmoos.com or loopback origins only.");
	}
	return Object.freeze({ ok: true, userId: String(userId) });
}

function isLoopbackOrigin(origin) {
	return origin.includes("127.0.0.1")
		|| origin.includes("localhost")
		|| origin.includes("[::1]");
}

function refusal(status, code, message) {
	return Object.freeze({
		ok: false,
		status,
		error: Object.freeze({ code, message })
	});
}

module.exports = { authorizeGptRequest };
