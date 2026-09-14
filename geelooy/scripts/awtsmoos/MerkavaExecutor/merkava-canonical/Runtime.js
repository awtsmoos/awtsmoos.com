//B"H
//Boruch Hashem
//Blessed be He

const { requireCapabilities } = require('./CapabilityPolicy.js');
const { SECTION } = require('./Format.js');
const { hostCapabilityNames } = require('./HostAbi.js');
const { encodeManifest } = require('./Manifest.js');
const { encodeSourceArchive } = require('./SourceArchive.js');
const { transitionEngine } = require('./TransitionEngines.js');
const { verifyCanonicalContainer } = require('./Verifier.js');
const { writeCanonicalContainer } = require('./Writer.js');

/**
 * Compiles HTML/CSS/JS source into the canonical outer container.
 * MAPP is the default transitional executable because its source integration is
 * currently stronger; callers may request Mode2 while the canonical ISA lands.
 * @param {{files:object,entry?:string,capabilities?:string[],targets?:string[],programEncoding?:string}} input Source project.
 * @returns {Promise<Uint8Array>} Canonical `.merkava` bytes.
 */
async function compileCanonicalProject(input = {}) {
	const entry = normalizeEntry(input.entry || '/index.html');
	const programEncoding = input.programEncoding || 'mapp-transition';
	const engine = transitionEngine(programEncoding);
	const files = normalizeFiles(input.files || {});
	const bytecode = await engine.compile({ entry, files });
	const source = encodeSourceArchive({ entry, files });
	const manifest = encodeManifest({
		capabilities: input.capabilities || [],
		entry,
		programEncoding,
		targets: input.targets || []
	});
	return writeCanonicalContainer({
		sections: [
			{ type: SECTION.MANIFEST, bytes: manifest },
			{ type: SECTION.BYTECODE, bytes: bytecode },
			{ type: SECTION.SOURCE, bytes: source }
		]
	});
}

/**
 * Verifies and executes a canonical project through its declared transition.
 * No bytecode dispatch occurs before structural and manifest verification.
 * @param {Uint8Array|Buffer|ArrayBuffer|number[]} input Container bytes.
 * @param {object} options Runtime options forwarded to the active engine.
 * @returns {object} Execution result.
 */
function runCanonicalProject(input, options = {}) {
	const report = verifiedReport(input, options);
	const engine = transitionEngine(report.manifest.programEncoding);
	const bytecode = report.container.byType.get(SECTION.BYTECODE).bytes;
	return engine.run(Buffer.from(bytecode), options);
}

/**
 * Decodes the executable payload without executing application code.
 * @param {Uint8Array|Buffer|ArrayBuffer|number[]} input Container bytes.
 * @returns {object} Safe inspection record.
 */
function inspectCanonicalProject(input) {
	const report = verifyCanonicalContainer(input);
	if (!report.ok) {
		return report;
	}
	const engine = transitionEngine(report.manifest.programEncoding);
	const bytecode = report.container.byType.get(SECTION.BYTECODE).bytes;
	return {
		...report,
		program: engine.decode(Buffer.from(bytecode))
	};
}

/** @returns {object} */
function verifiedReport(input, options = {}) {
	const report = verifyCanonicalContainer(input, {
		knownCapabilities: hostCapabilityNames()
	});
	if (!report.ok) {
		throw new Error(`merkava_verification_failed:${report.errors.join(',')}`);
	}
	requireCapabilities(
		report.manifest.capabilities,
		options.availableCapabilities || []
	);
	return report;
}

/** @returns {string} */
function normalizeEntry(value) {
	const clean = String(value || '/index.html').replace(/\\/g, '/').replace(/^\.\//, '');
	return clean.startsWith('/') ? clean : `/${clean}`;
}

/** @returns {object} */
function normalizeFiles(files) {
	const normalized = {};
	for (const [name, source] of Object.entries(files)) {
		normalized[normalizeEntry(name)] = String(source ?? '');
	}
	return normalized;
}

module.exports = {
	compileCanonicalProject,
	inspectCanonicalProject,
	runCanonicalProject
};
