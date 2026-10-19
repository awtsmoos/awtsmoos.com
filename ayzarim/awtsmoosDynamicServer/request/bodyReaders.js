//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos holds a river of pure bytes, bounded and free;
 * Awtsmoos.com separates raw streams from JSON's ordinary sea.
 */
async function readBodyIfNeeded(options) {
	const method = String(options.request.method || "GET").toUpperCase();
	if (shouldStreamDriveUpload(options.request)) return;
	if (shouldStreamBinaryArtifactUpload(options.request)) return;
	if (method === "POST") await options.getPostData();
	if (method === "PUT") await options.getPutData();
	if (method === "DELETE") await options.getDeleteData();
}

/** Preserve the previously supported raw Drive PUT route unchanged. */
function shouldStreamDriveUpload(request) {
	if (String(request.method || "").toUpperCase() !== "PUT") return false;
	try {
		const pathname = new URL(String(request.url || "/"), "http://awtsmoos.local").pathname;
		return /^\/api\/social\/drive\/[^/]+\/stream\/.+/.test(pathname);
	} catch {
		return false;
	}
}

/** Never allow the JSON parser to consume a scoped binary upload. */
function shouldStreamBinaryArtifactUpload(request) {
	if (String(request.method || "").toUpperCase() !== "PUT") return false;
	try {
		const pathname = new URL(String(request.url || "/"), "http://awtsmoos.local").pathname;
		return /^\/api\/tunnel\/control\/artifact\/binary\/chunk\/[a-f0-9]{32}$/.test(pathname);
	} catch {
		return false;
	}
}

module.exports = {
	readBodyIfNeeded,
	shouldStreamDriveUpload,
	shouldStreamBinaryArtifactUpload
};
