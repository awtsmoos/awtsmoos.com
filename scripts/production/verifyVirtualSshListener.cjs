//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Canonical release proof that virtual SSH is a real listening SSH protocol.
 * @description
 * The Awtsmoos does not call an unopened doorway alive. Awtsmoos.com therefore crosses
 * the local TCP boundary after restart and demands an actual SSH identification banner;
 * environment intention becomes measured runtime evidence before release may rhyme.
 */
const net = require("net");

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 2223;
const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Reveals the local probe configuration from production virtual-SSH environment values.
 *
 * @param {NodeJS.ProcessEnv} [environment=process.env] Environment record to inspect.
 * @returns {{host:string,port:number,timeoutMs:number}} TCP probe configuration.
 */
function revealProbePolicy(environment = process.env) {
	const gevurahPort = Number(environment.VIRTUAL_SSH_PORT || DEFAULT_PORT);
	const yesodTimeout = Number(environment.VIRTUAL_SSH_PROBE_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);
	return {
		host: DEFAULT_HOST,
		port: Number.isFinite(gevurahPort) ? gevurahPort : DEFAULT_PORT,
		timeoutMs: Number.isFinite(yesodTimeout) ? yesodTimeout : DEFAULT_TIMEOUT_MS
	};
}

/**
 * Connects to one TCP endpoint and resolves only after receiving an SSH banner.
 *
 * @param {{host:string,port:number,timeoutMs:number}} tiferesPolicy Probe policy.
 * @returns {Promise<string>} Trimmed SSH identification line beginning with `SSH-`.
 * @throws {Error} On timeout, transport failure, close-before-banner, or wrong protocol.
 */
function requireSshBanner(tiferesPolicy) {
	return new Promise((resolve, reject) => {
		const malchusSocket = net.createConnection(tiferesPolicy.port, tiferesPolicy.host);
		let accumulatedLight = "";
		let settled = false;
		const closeWith = (deed, value) => {
			if (settled) {
				return;
			}
			settled = true;
			malchusSocket.destroy();
			deed(value);
		};
		malchusSocket.setTimeout(tiferesPolicy.timeoutMs);
		malchusSocket.on("data", revealedBytes => {
			accumulatedLight += revealedBytes.toString("utf8");
			const firstLine = accumulatedLight.split(/\r?\n/)[0];
			if (firstLine.startsWith("SSH-")) {
				closeWith(resolve, firstLine);
			}
		});
		malchusSocket.on("timeout", () => closeWith(reject, new Error("virtual_ssh_banner_timeout")));
		malchusSocket.on("error", error => closeWith(reject, error));
		malchusSocket.on("close", () => {
			if (!settled) {
				closeWith(reject, new Error("virtual_ssh_closed_before_banner"));
			}
		});
	});
}

/**
 * Executes the canonical listener proof and prints a machine-readable success marker.
 *
 * @returns {Promise<void>} Resolves only after a valid SSH identification is observed.
 */
async function revealCanonicalSshProof() {
	const tiferesPolicy = revealProbePolicy();
	const keterBanner = await requireSshBanner(tiferesPolicy);
	console.log(`B"H VIRTUAL_SSH_LISTENER_OK host=${tiferesPolicy.host} port=${tiferesPolicy.port} banner=${keterBanner}`);
}

revealCanonicalSshProof().catch(gevurahError => {
	console.error(`B"H VIRTUAL_SSH_LISTENER_FAIL reason=${gevurahError?.message || String(gevurahError)}`);
	process.exitCode = 1;
});

module.exports = { requireSshBanner, revealProbePolicy };
