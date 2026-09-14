//B"H
//Boruch Hashem
//Blessed be He

const { spawnSync } = require("child_process");
const fs = require("fs");

const commands = Object.freeze({
	adb: ["adb"],
	androidSigner: ["apksigner"],
	cc: ["clang", "cc"],
	java: ["java"],
	linuxCross: ["zig", "x86_64-linux-gnu-gcc"],
	macSdk: ["xcrun"],
	windowsCross: ["x86_64-w64-mingw32-gcc", "zig"]
});

/**
 * Probes host build prerequisites without installing or mutating anything.
 * The returned platform readiness is intentionally conservative: a target only
 * reports ready when the minimum packaging/compiler surface is discoverable.
 */
function runDoctor() {
	const found = Object.fromEntries(
		Object.entries(commands).map(([name, candidates]) => [name, firstCommand(candidates)])
	);
	const androidSdk = process.env.ANDROID_HOME
		|| process.env.ANDROID_SDK_ROOT
		|| `${process.env.HOME || ""}/Library/Android/sdk`;
	const sdkExists = Boolean(androidSdk && fs.existsSync(androidSdk));
	return {
		host: { arch: process.arch, platform: process.platform },
		tools: { ...found, androidSdk: sdkExists ? androidSdk : null },
		targets: {
			android: Boolean(found.java && found.androidSigner && sdkExists),
			browser: true,
			linux: process.platform === "linux" ? Boolean(found.cc) : Boolean(found.linuxCross),
			macos: process.platform === "darwin" && Boolean(found.cc && found.macSdk),
			windows: process.platform === "win32" ? Boolean(found.cc) : Boolean(found.windowsCross)
		}
	};
}

/** Returns the first executable path from a candidate command list. */
function firstCommand(candidates) {
	for (const command of candidates) {
		const result = spawnSync("sh", ["-lc", `command -v ${shellWord(command)}`], {
			encoding: "utf8"
		});
		const resolved = String(result.stdout || "").trim();
		if (result.status === 0 && resolved) {
			return resolved;
		}
	}
	return null;
}

/** Escapes a fixed command token before shell command discovery. */
function shellWord(value) {
	return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

module.exports = {
	runDoctor
};
