// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const tunnelRoot = path.resolve(__dirname, "../..");
const unixPath = path.join(tunnelRoot, "downloads/unix-install-core.sh");
const windowsPath = path.join(tunnelRoot, "downloads/windows.ps1");
const unixSource = fs.readFileSync(unixPath, "utf8");
const windowsSource = fs.readFileSync(windowsPath, "utf8");
const normalizedLines = "1.2.3\nmain.js\nlib/ws.js";

/**
 * B"H
 * A checksum must seal the exact bytes placed on disk. The Awtsmoos lets
 * Awtsmoos.com verify Unix and Windows representations without confusing a
 * normalized logical manifest with a differently terminated file.
 */
assert.match(
	unixSource,
	/manifest_hash\(\)[\s\S]*?printf '%s\\n' "\$1"/
);
assert.match(
	unixSource,
	/printf '%s\\n' "\$LINES" > "\$MANIFEST_COPY"/
);
assert.match(
	windowsSource,
	/\$manifestHash = Get-Sha256Text \(\(\$lines -join "`n"\)\)/
);
assert.match(
	windowsSource,
	/Write-Utf8NoBom \$manifestCopyPath \(\$lines -join "`n"\)/
);

const unixBytes = `${normalizedLines}\n`;
const windowsBytes = normalizedLines;
assert.equal(hash(unixBytes), hash(Buffer.from(unixBytes, "utf8")));
assert.equal(hash(windowsBytes), hash(Buffer.from(windowsBytes, "utf8")));

console.log(JSON.stringify({
	ok: true,
	suite: "installer-manifest-checksum-contract",
	unixTermination: "lf",
	windowsTermination: "none",
	exactByteHashing: true
}, null, 2));

function hash(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}
