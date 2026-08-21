// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns local tunnel HTTP framing, bounded bodies, CORS, and JSON responses.
 * @description
 * The Awtsmoos gives every byte a measured vessel and every response a single seal;
 * Awtsmoos.com keeps transport concerns apart from action truth so both remain real.
 */
function readBody(request, limit, parseJson) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		let total = 0;
		request.on("data", chunk => {
			total += chunk.length;
			if (total > limit) {
				reject(new Error("local_api_body_too_large"));
				request.destroy();
				return;
			}
			chunks.push(chunk);
		});
		request.on("error", reject);
		request.on("end", () => {
			const buffer = Buffer.concat(chunks);
			if (!parseJson) return resolve(buffer);
			const text = buffer.toString("utf8").trim();
			resolve(text ? JSON.parse(text) : {});
		});
	});
}

function bounded(value, fallback) {
	const number = Number(value || fallback);
	return Number.isFinite(number)
		? Math.max(1, Math.min(65535, Math.floor(number)))
		: fallback;
}

function setCors(response) {
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
	response.setHeader(
		"Access-Control-Allow-Headers",
		"content-type,x-awtsmoos-local-token,x-awtsmoos-duration,x-awtsmoos-index"
	);
}

function endJson(response, status, data) {
	response.writeHead(status, {
		"content-type": "application/json; charset=utf-8"
	});
	response.end(status === 204 ? "" : JSON.stringify(data));
}

function binaryHlsMatch(pathName) {
	const match = /^\/streaming\/hls-segment\/([^/]+)\/([^/]+)$/.exec(pathName);
	return match && {
		sessionId: decodeURIComponent(match[1]),
		name: decodeURIComponent(match[2])
	};
}

module.exports = {
	binaryHlsMatch,
	bounded,
	endJson,
	readBody,
	setCors
};
