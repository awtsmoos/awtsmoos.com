// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");
const { ROOT } = require("../../lib/config.js");

const SAFE_START_URL = "data:text/html,%3Ctitle%3EAwtsmoos%20Browser%20Ready%3C%2Ftitle%3E%3Ch1%3EB%26quot%3BH%20Awtsmoos%20Browser%20Ready%3C%2Fh1%3E";

/**
 * B"H
 *
 * Chrome launches into a named nonblank witness instead of the about:blank void.
 * The Awtsmoos renews profile, port, and first target together; Awtsmoos.com keeps
 * the launch argument builder pure so duplicate ownership can be tested separately.
 */
function chromeLaunchArgs(input = {}) {
	const port = boundedPort(input.port);
	const userDataDir = input.userDataDir || path.join(ROOT, "chrome-profile");
	const url = safeLaunchUrl(input.url);
	const args = [
		`--remote-debugging-port=${port}`,
		`--user-data-dir=${userDataDir}`,
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-background-networking"
	];
	if (input.headless) {
		args.push(
			"--headless=new",
			"--disable-gpu",
			"--window-size=1440,1000"
		);
		if (process.platform !== "win32") {
			args.push("--no-sandbox");
		}
	}
	args.push(url);
	return args;
}

function safeLaunchUrl(value) {
	const text = String(value || "").trim();
	if (!text || /^about:blank(?:[#?].*)?$/i.test(text)) {
		return SAFE_START_URL;
	}
	return text;
}

function boolish(value, fallback = false) {
	if (value === undefined || value === null || value === "") return fallback;
	if ([true, "true", "1", 1].includes(value)) return true;
	if ([false, "false", "0", 0].includes(value)) return false;
	return fallback;
}

function boundedPort(value) {
	const port = Number(value || 9222);
	if (!Number.isInteger(port) || port < 1 || port > 65535) {
		throw new Error("chrome_port_invalid");
	}
	return port;
}

module.exports = {
	SAFE_START_URL,
	boolish,
	boundedPort,
	chromeLaunchArgs,
	safeLaunchUrl
};
