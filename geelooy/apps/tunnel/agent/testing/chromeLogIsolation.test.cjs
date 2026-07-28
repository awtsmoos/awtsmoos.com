// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const installRoot = path.join(os.tmpdir(), `awtsmoos-chrome-log-isolation-${process.pid}`);
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;

const Logs = require("../tools/chrome/logs.js");
const { isChromeError } = require("../tools/chrome/extras.js");

try {
	const cancelled = Logs.captureCdpEvent({
		method: "Network.loadingFailed",
		params: {
			requestId: "cancelled-navigation",
			errorText: "net::ERR_ABORTED",
			type: "Document",
			canceled: true
		}
	});
	const failed = Logs.captureCdpEvent({
		method: "Network.loadingFailed",
		params: {
			requestId: "real-failure",
			errorText: "net::ERR_CONNECTION_REFUSED",
			type: "Document"
		}
	});

	assert.equal(cancelled.level, "warning");
	assert.equal(cancelled.details.cancelled, true);
	assert.equal(isChromeError(cancelled), false);
	assert.equal(failed.level, "error");
	assert.equal(isChromeError(failed), true);
	assert.equal(Logs.NETWORK_LOG.startsWith(installRoot + path.sep), true);
	assert.match(path.basename(Logs.NETWORK_LOG), new RegExp(`${process.pid}\\.jsonl$`));
	assert.equal(Logs.NETWORK_LOG.includes(process.cwd()), false);

	console.log(JSON.stringify({
		ok: true,
		cancelledNavigationIsWarning: true,
		realNetworkFailureIsError: true,
		perWorkerLog: Logs.NETWORK_LOG
	}, null, 2));
} finally {
	fs.rmSync(installRoot, { recursive: true, force: true });
}
