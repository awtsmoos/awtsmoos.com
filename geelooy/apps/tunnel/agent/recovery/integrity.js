// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const REQUIRED = [
	"main.js",
	"config.json",
	"install-state.txt",
	"installed-manifest.txt",
	"install-manifest.sha256",
	"tools/fs/commandJob/schedulerState.js",
	"tools/fs/commandJob/concurrencyProfile.js"
];
const MUTABLE_IDENTITY_FILES = new Set([
	"config.json"
]);

/**
 * B"H
 * Integrity asks executable vessels to bear witness before they run. The
 * Awtsmoos lets Awtsmoos.com preserve a living tunnel identity across offline
 * restoration while immutable code and manifest seals remain uncompromised.
 */
function check(root) {
	const failures = [];
	for (const relative of REQUIRED) {
		if (!fs.existsSync(path.join(root, relative))) failures.push(`missing:${relative}`);
	}
	verifyManifestChecksum(root, failures);
	verifyManifestFiles(root, failures);
	verifyCriticalSeal(root, failures);
	verifyScheduler(root, failures);
	return {
		ok: failures.length === 0,
		failures,
		restoreRequired: failures.some(item => !item.startsWith("scheduler:"))
	};
}

function seal(root) {
	const critical = REQUIRED.filter(relative =>
		!MUTABLE_IDENTITY_FILES.has(relative) &&
		fs.existsSync(path.join(root, relative))
	);
	const hashes = Object.fromEntries(critical.map(relative => [
		relative,
		hash(path.join(root, relative))
	]));
	const target = path.join(root, "recovery-seal.json");
	fs.writeFileSync(target, `${JSON.stringify({
		version: 2,
		mutableIdentityFiles: [...MUTABLE_IDENTITY_FILES],
		hashes
	}, null, 2)}\n`);
	return {
		ok: true,
		target,
		files: critical.length,
		mutableIdentityFiles: [...MUTABLE_IDENTITY_FILES]
	};
}

function verifyManifestChecksum(root, failures) {
	try {
		const expected = fs.readFileSync(path.join(root, "install-manifest.sha256"), "utf8").trim().split(/\s+/)[0];
		const actual = hash(path.join(root, "installed-manifest.txt"));
		if (expected !== actual) failures.push("manifest:checksum_mismatch");
	} catch (error) {
		failures.push(`manifest:${error.code || "read_failed"}`);
	}
}

function verifyManifestFiles(root, failures) {
	try {
		const lines = fs.readFileSync(path.join(root, "installed-manifest.txt"), "utf8")
			.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
		for (const relative of lines.slice(2)) {
			if (!fs.existsSync(path.join(root, relative))) {
				failures.push(`manifest_missing:${relative}`);
				if (failures.length > 20) break;
			}
		}
	} catch {}
}

function verifyCriticalSeal(root, failures) {
	const target = path.join(root, "recovery-seal.json");
	if (!fs.existsSync(target)) return;
	try {
		const sealData = JSON.parse(fs.readFileSync(target, "utf8"));
		for (const [relative, expected] of Object.entries(sealData.hashes || {})) {
			const file = path.join(root, relative);
			if (!fs.existsSync(file) || hash(file) !== expected) failures.push(`seal:${relative}`);
		}
	} catch {
		failures.push("seal:invalid");
	}
}

function verifyScheduler(root, failures) {
	try {
		const profile = require(path.join(root, "tools/fs/commandJob/concurrencyProfile.js"));
		if (profile.resolve({}).tier !== 5) failures.push("scheduler:profile_invalid");
	} catch (error) {
		failures.push(`scheduler:${error.code || "load_failed"}`);
	}
}

function hash(file) {
	return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

module.exports = {
	MUTABLE_IDENTITY_FILES,
	check,
	hash,
	seal
};
