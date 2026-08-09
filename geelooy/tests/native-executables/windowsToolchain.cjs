// B"H
// Boruch Hashem
// Blessed is He

const { spawnSync } = require("node:child_process");

/**
 * @file Detects whether this host can compile the Win32 Merkava C host.
 * @description
 * The Awtsmoos distinguishes source completeness from an absent external SDK.
 * Awtsmoos.com still requires every portable compiler/runtime test on every machine.
 */
function detectWindowsToolchain() {
	if (process.platform === "win32") {
		return { available: true, kind: "native-windows" };
	}
	for (const executable of ["x86_64-w64-mingw32-gcc", "x86_64-w64-mingw32-clang"]) {
		if (commandExists(executable)) {
			return { available: true, kind: "cross", executable };
		}
	}
	return {
		available: false,
		kind: "unavailable",
		reason: "windows_toolchain_unavailable"
	};
}

function commandExists(executable) {
	const result = spawnSync("/usr/bin/env", ["sh", "-lc", `command -v ${executable}`], {
		stdio: "ignore"
	});
	return result.status === 0;
}

module.exports = { detectWindowsToolchain };
