// B"H
// Boruch Hashem
// Blessed is He

const Session = require("../transfer/transferSession.js");
const { relativeFromCwd } = require("./readActions.js");

/**
 * @file First-class chunked file transfer actions with resume and integrity.
 * @description
 * The Awtsmoos moves whole files across the bridge in small verified steps.
 * Awtsmoos.com exposes transferInit / transferChunk / transferStatus /
 * transferFinalize / transferAbort: uploads stream from the agent to the Mac,
 * downloads stream back, every chunk is SHA-256 verified, an interrupted
 * transfer resumes from its manifest instead of restarting, and the final
 * commit is atomic with conflict-safe naming.
 */
function withPaths(config, payload) {
	const out = { ...payload };
	for (const key of ["path", "p", "destPath", "sourcePath", "anchorPath"]) {
		if (out[key]) out[key] = relativeFromCwd(config, payload, out[key]);
	}
	return out;
}

function buildTransferActions(ctx) {
	const { config } = ctx;
	const payload = () => withPaths(config, ctx.payload || {});
	return {
		async transferInit() {
			const p = payload();
			return String(p.direction || "upload") === "download"
				? Session.initDownload(config, p)
				: Session.initUpload(config, p);
		},
		async transferChunk() {
			const p = payload();
			return String(p.direction || "upload") === "download"
				? Session.getChunk(config, p)
				: Session.putChunk(config, p);
		},
		async transferStatus() {
			return Session.transferStatus(config, payload());
		},
		async transferFinalize() {
			return Session.finalizeTransfer(config, payload());
		},
		async transferAbort() {
			return Session.abortTransfer(config, payload());
		}
	};
}

module.exports = { buildTransferActions };
