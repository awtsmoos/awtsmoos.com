// B"H

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const installer = fs.readFileSync(
	path.resolve(__dirname, "../../downloads/unix.sh"),
	"utf8"
);

assert.match(installer, /AWTSMOOS_INSTALL_PARALLEL_DOWNLOADS:-8/);
assert.match(installer, /parallel_downloads" -le 16/);
assert.match(installer, /wait_for_download_batch/);
assert.match(installer, /connect-timeout 10/);
assert.ok(installer.includes('temporary="$runtime_root/.$helper.part"'));
assert.match(installer, /mv -f "\$temporary" "\$runtime_root\/\$helper"/);
assert.doesNotMatch(
	installer,
	/Downloading reinstall components[^]*curl -fsSL[^]*chmod \+x "\$runtime_root\/\$helper"/,
	"bootstrap reverted to serial direct-to-final downloads"
);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-parallel-bootstrap-downloads",
	defaultConcurrency: 8,
	maxConcurrency: 16,
	atomicDownloads: true
}, null, 2));
