//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Protocol-level readiness probe for the production virtual-OS SSH doorway.
 * @description
 * The Awtsmoos does not confuse an occupied port with a living protocol; Awtsmoos.com
 * opens one bounded TCP eye and accepts the doorway only when an SSH-2.0 identification
 * line answers from within, so deployment truth and network reality can rhyme.
 */
const net = require("node:net");
const Policy = require("./virtualSshProbePolicy.cjs");

/**
 * Connects to one endpoint and proves that its first line is an SSH-2.0 banner.
 *
 * @param {object} [options={}] Probe options.
 * @param {string} [options.host="127.0.0.1"] TCP host.
 * @param {number|string} options.port TCP port.
 * @param {number|string} [options.timeoutMs=3000] Bounded wait for protocol identity.
 * @returns {Promise<{host:string,port:number,banner:string}>} Verified endpoint identity.
 */
function probeVirtualSsh(options = {}) {
	const config = Policy.revealProbeConfig(options);
	return new Promise((resolve, reject) => {
		const socket = net.createConnection({
			host: config.host,
			port: config.port
		});
		let settled = false;
		let bannerBuffer = "";

		const finish = (error, result) => {
			if (settled) {
				return;
			}
			settled = true;
			socket.destroy();
			error ? reject(error) : resolve(result);
		};

		socket.setTimeout(config.timeoutMs, () => {
			finish(Policy.revealProbeError("virtual_ssh_probe_timeout"));
		});
		socket.on("error", () => {
			finish(Policy.revealProbeError("virtual_ssh_probe_connection_failed"));
		});
		socket.on("end", () => {
			finish(Policy.revealProbeError("virtual_ssh_probe_closed_before_banner"));
		});
		socket.on("data", chunk => {
			bannerBuffer += chunk.toString("utf8");
			if (Buffer.byteLength(bannerBuffer) > Policy.MAX_BANNER_BYTES) {
				finish(Policy.revealProbeError("virtual_ssh_probe_banner_too_large"));
				return;
			}
			const newline = bannerBuffer.indexOf("\n");
			if (newline < 0) {
				return;
			}
			const banner = bannerBuffer.slice(0, newline).replace(/\r$/, "");
			if (!Policy.isSshBanner(banner)) {
				finish(Policy.revealProbeError("virtual_ssh_probe_invalid_banner"));
				return;
			}
			finish(null, {
				host: config.host,
				port: config.port,
				banner
			});
		});
	});
}

/**
 * Runs the same protocol proof as a bounded deployment CLI.
 *
 * @returns {Promise<void>} Completion after success marker or nonzero failure marker.
 */
async function runCli() {
	try {
		const result = await probeVirtualSsh({
			host: process.argv[2],
			port: process.argv[3],
			timeoutMs: process.argv[4]
		});
		console.log(`B"H VIRTUAL_SSH_PROTOCOL_READY host=${result.host} port=${result.port} banner=${result.banner}`);
	} catch (error) {
		console.error(`B"H VIRTUAL_SSH_PROTOCOL_PROBE_FAIL code=${error.code || "unknown"}`);
		process.exitCode = 1;
	}
}

if (require.main === module) {
	runCli();
}

module.exports = {
	probeVirtualSsh
};
