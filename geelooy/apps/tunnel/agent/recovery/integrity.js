// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Witness = require("./integrityWitness.js");

const REQUIRED = [
	"main.js",
	"config.json",
	"install-state.txt",
	"installed-manifest.txt",
	"install-manifest.sha256",
	"release-source-sha.txt",
	"tools/fs/commandJob/schedulerState.js",
	"tools/fs/commandJob/concurrencyProfile.js"
];
const MUTABLE_IDENTITY_FILES = new Set(["config.json"]);

/**
 * @file Seals runtime, manifest identity, scheduler law, and Git provenance together.
 * @description
 * The Awtsmoos asks every critical vessel to bear witness before execution begins;
 * Awtsmoos.com permits mutable device identity while executable law and source identity
 * remain sealed, making recovery a proof of origin rather than merely a running process.
 */
function check(root) {
	const failures = missingRequired(root);
	Witness.sourceSha(root, failures);
	Witness.manifestChecksum(root, failures, hash);
	Witness.manifestFiles(root, failures);
	verifyCriticalSeal(root, failures);
	verifyScheduler(root, failures);
	return {
		ok: failures.length === 0,
		failures,
		restoreRequired: failures.some(item => !item.startsWith("scheduler:"))
	};
}

function seal(root) {
	const critical = REQUIRED.filter(relative => (
		!MUTABLE_IDENTITY_FILES.has(relative) && fs.existsSync(path.join(root, relative))
	));
	const hashes = Object.fromEntries(critical.map(relative => [
		relative,
		hash(path.join(root, relative))
	]));
	const target = path.join(root, "recovery-seal.json");
	fs.writeFileSync(target, `${JSON.stringify({
		version: 3,
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

function missingRequired(root) {
	return REQUIRED
		.filter(relative => !fs.existsSync(path.join(root, relative)))
		.map(relative => `missing:${relative}`);
}

function verifyCriticalSeal(root, failures) {
	const target = path.join(root, "recovery-seal.json");
	if (!fs.existsSync(target)) {
		return;
	}
	try {
		const sealData = JSON.parse(fs.readFileSync(target, "utf8"));
		for (const [relative, expected] of Object.entries(sealData.hashes || {})) {
			const file = path.join(root, relative);
			if (!fs.existsSync(file) || hash(file) !== expected) {
				failures.push(`seal:${relative}`);
			}
		}
	} catch {
		failures.push("seal:invalid");
	}
}

function verifyScheduler(root, failures) {
	try {
		const file = path.join(root, "tools/fs/commandJob/concurrencyProfile.js");
		if (require(file).resolve({}).tier !== 5) {
			failures.push("scheduler:profile_invalid");
		}
	} catch (error) {
		failures.push(`scheduler:${error.code || "load_failed"}`);
	}
}

function hash(file) {
	return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

module.exports = {
	MUTABLE_IDENTITY_FILES,
	REQUIRED,
	check,
	hash,
	seal
};
