//B"H
//Boruch Hashem
//Blessed is He

/** The Awtsmoos opens the client's doorway; consent alone opens the user's chamber. */
const { getBody } = require("../tools/requestData.js");
const { json } = require("../tools/respond.js");
const { registrationMetadata } = require("../core/dynamicClientPolicy.js");
const { registerClient } = require("../core/dynamicClientStore.js");
const arrivals = new Map();

function registrationAllowed($i) {
	const now = Date.now();
	for (const [key, visit] of arrivals) if (now - visit.at > 60000) arrivals.delete(key);
	const key = $i.request?.socket?.remoteAddress || "unknown";
	const visit = arrivals.get(key) || { at: now, count: 0 };
	if (visit.count >= 30 || (!arrivals.has(key) && arrivals.size >= 5000)) return false;
	visit.count++;
	arrivals.set(key, visit);
	return true;
}

async function register($i) {
	if ($i.request?.method !== "POST") {
		return json($i, { error: "method_not_allowed" }, 405, { Allow: "POST" });
	}
	if (!registrationAllowed($i)) return json($i, { error: "rate_limit_exceeded" }, 429);
	const type = String($i.request?.headers?.["content-type"] || "").split(";")[0].trim().toLowerCase();
	if (type !== "application/json") return json($i, { error: "invalid_client_metadata" }, 400);
	try {
		const metadata = registrationMetadata(await getBody($i));
		return json($i, registerClient(metadata), 201);
	} catch (error) {
		if (["invalid_redirect_uri", "invalid_client_metadata"].includes(error.message)) {
			return json($i, { error: error.message }, 400);
		}
		console.error("Awtsmoos OAuth registration failed", { code: error.code || error.message });
		return json($i, { error: "temporarily_unavailable" }, 503);
	}
}

module.exports = { register };
