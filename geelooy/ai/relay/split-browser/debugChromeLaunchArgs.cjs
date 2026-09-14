//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Builds the conservative visible Shared AI Chrome command line.
 * @description
 * The dedicated profile keeps normal page networking and authentication while
 * disabling unrelated startup/background work that can amplify resource spikes.
 */
function build(options = {}) {
	const requested = Number(options.requested || 0);
	const profile = String(options.profile || "");
	const host = String(options.host || "127.0.0.1");
	const launchUrl = String(options.launchUrl || "about:blank");
	return [
		`--remote-debugging-port=${requested}`,
		`--remote-debugging-address=${host}`,
		`--user-data-dir=${profile}`,
		"--no-first-run",
		"--no-default-browser-check",
		"--disable-background-networking",
		"--disable-component-update",
		"--disable-default-apps",
		"--new-window",
		launchUrl
	];
}

module.exports = { build };
