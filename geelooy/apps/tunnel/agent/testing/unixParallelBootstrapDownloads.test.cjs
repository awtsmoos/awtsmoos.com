// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const installer = fs.readFileSync(
	path.resolve(__dirname, "../../downloads/unix.sh"),
	"utf8"
);
const componentSource = fs.readFileSync(
	path.resolve(__dirname, "../../downloads/unix-bootstrap-components-download.sh"),
	"utf8"
);

assert.match(componentSource, /installer-components\.tar\.gz/);
assert.match(componentSource, /file_sha256/);
assert.match(componentSource, /Using cached verified installer components/);
assert.match(componentSource, /AWTSMOOS_INSTALL_PARALLEL_DOWNLOADS:-4/);
assert.ok(componentSource.includes("\"$parallel\" -le 4"));
assert.match(componentSource, /wait_for_component_batch/);
assert.match(componentSource, /fallback_origin_ready/);
assert.ok(componentSource.includes('temporary="$runtime_root/.$helper.part"'));
assert.match(componentSource, /mv -f "\$temporary" "\$runtime_root\/\$helper"/);
assert.doesNotMatch(
	installer,
	/Downloading reinstall components[^]*curl -fsSL[^]*chmod \+x "\$runtime_root\/\$helper"/,
	"bootstrap reverted to serial direct-to-final downloads"
);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-parallel-bootstrap-downloads",
	preferredBundleRequests: 1,
	defaultFallbackConcurrency: 4,
	maxConcurrency: 4,
	atomicFallbackDownloads: true,
	hashVerifiedBundle: true
}, null, 2));
