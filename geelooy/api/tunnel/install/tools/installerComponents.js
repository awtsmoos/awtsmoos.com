// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { geelooyRoot } = require("./sourceFile.js");

const COMPONENTS = Object.freeze([
	"unix-install-core.sh",
	"unix-install-log.sh",
	"unix-install-progress.sh",
	"unix-install-browser.sh",
	"unix-install-success.sh",
	"unix-install-readiness.sh",
	"unix-version-policy.sh",
	"unix-install-lock.sh",
	"unix-install-lock-owner.cjs",
	"unix-log-retention.sh",
	"unix-device-identity-state.sh",
	"unix-state-migration.sh",
	"unix-chrome-profile-process.cjs",
	"unix-displaced-cleanup.sh",
	"unix-package-io.sh",
	"unix-release-metadata.sh",
	"unix-package-config.sh",
	"unix-package-stage.sh",
	"unix-install-resume.sh",
	"unix-fast-repair.sh",
	"unix-legacy-catalog.sh",
	"unix-process-census.sh",
	"unix-process-runtime.sh",
	"unix-process-control.sh",
	"unix-service-identity.sh",
	"unix-service-manager.sh",
	"unix-supervisor-install.sh",
	"unix-connection-health.sh",
	"unix-project-root-health.sh",
	"unix-project-root-compat.sh",
	"unix-service-health.sh",
	"unix-legacy-fallback.sh",
	"unix-agent-singleton.cjs",
	"unix-agent-receipt.cjs",
	"unix-agent-launcher.cjs",
	"unix-recovery-archive-list.sh",
	"unix-recovery-retention.sh",
	"unix-recovery-store.sh",
	"unix-recovery-validation.sh",
	"unix-recovery-candidates.sh",
	"unix-recovery-rescue.sh",
	"unix-activation-state.sh",
	"unix-activation-fresh.sh",
	"unix-activation-rollback.sh",
	"unix-activation.sh",
	"unix-cleanup.sh",
	"unix-supervisor-runtime.sh",
	"unix-supervisor-agents.sh",
	"unix-supervisor-guard.sh",
	"unix-supervisor-health-memory.sh",
	"unix-supervisor-receipt.sh",
	"unix-supervisor-health.sh",
	"unix-supervisor-recovery.sh",
	"unix-supervisor-legacy.sh",
	"unix-supervisor.sh",
	"awtsmoos-tunnel-client.js"
]);

let cached = null;

/**
 * Publishes all bootstrap helpers as one deterministic, hash-sealed gzip tar.
 * The bootstrap retains its individual-download fallback for older or partial
 * servers, while normal installs avoid dozens of independent HTTPS requests.
 */
function buildInstallerComponents() {
	const sources = componentSources();
	const sourceSha256 = hash(Buffer.concat(sources.flatMap(source => [
		Buffer.from(`${source.name}\0`),
		source.data
	])));
	if (cached?.sourceSha256 === sourceSha256) return cached;

	const tar = buildTar(sources);
	const buffer = zlib.gzipSync(tar, {
		level: zlib.constants.Z_BEST_COMPRESSION,
		mtime: 0
	});
	cached = Object.freeze({
		buffer,
		bytes: buffer.length,
		sha256: hash(buffer),
		sourceSha256,
		files: sources.length,
		names: COMPONENTS
	});
	return cached;
}

function componentSources() {
	const root = path.join(geelooyRoot(), "apps", "tunnel", "downloads");
	return COMPONENTS.map(name => {
		const full = path.join(root, name);
		if (!fs.statSync(full).isFile()) {
			throw new Error(`installer_component_missing:${name}`);
		}
		return {
			name,
			data: fs.readFileSync(full)
		};
	});
}

function buildTar(sources) {
	const parts = [];
	for (const source of sources) {
		const header = tarHeader(source.name, source.data.length);
		const remainder = source.data.length % 512;
		const padding = remainder ? Buffer.alloc(512 - remainder) : Buffer.alloc(0);
		parts.push(header, source.data, padding);
	}
	parts.push(Buffer.alloc(1024));
	return Buffer.concat(parts);
}

function tarHeader(name, size) {
	const nameBytes = Buffer.from(name);
	if (!nameBytes.length || nameBytes.length > 100) {
		throw new Error(`installer_component_name_invalid:${name}`);
	}
	const header = Buffer.alloc(512);
	nameBytes.copy(header, 0);
	writeOctal(header, 100, 8, 0o755);
	writeOctal(header, 108, 8, 0);
	writeOctal(header, 116, 8, 0);
	writeOctal(header, 124, 12, size);
	writeOctal(header, 136, 12, 0);
	header.fill(0x20, 148, 156);
	header[156] = "0".charCodeAt(0);
	Buffer.from("ustar\0").copy(header, 257);
	Buffer.from("00").copy(header, 263);
	Buffer.from("awtsmoos").copy(header, 265);
	Buffer.from("awtsmoos").copy(header, 297);
	const checksum = header.reduce((sum, byte) => sum + byte, 0);
	const checksumText = checksum.toString(8).padStart(6, "0");
	Buffer.from(`${checksumText}\0 `).copy(header, 148);
	return header;
}

function writeOctal(buffer, offset, length, value) {
	const text = Number(value).toString(8).padStart(length - 1, "0");
	if (text.length >= length) throw new Error("installer_component_tar_field_overflow");
	Buffer.from(`${text}\0`).copy(buffer, offset);
}

function hash(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = {
	COMPONENTS,
	buildInstallerComponents,
	buildTar,
	componentSources,
	tarHeader
};
