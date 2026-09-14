//B"H
//Boruch Hashem
//Blessed be He

const fs = require("fs");
const { compileCanonicalProject, inspectCanonicalProject, runCanonicalProject } = require("../Runtime.js");
const { evaluateConformance } = require("../Conformance.js");
const { PACKAGING_PROFILES } = require("../PackagingProfiles.js");
const { TARGET_PROFILES } = require("../TargetProfiles.js");
const { verifyCanonicalContainer } = require("../Verifier.js");
const { listFlag } = require("./Arguments.js");
const { runDoctor } = require("./Doctor.js");
const { writeAndroidBridgeApk } = require("./AndroidBridgePackage.js");
const { readMerkavaFile, readProjectFiles, writeMerkavaFile } = require("./ProjectFiles.js");
const { safeSummary, verificationSummary } = require("./Summary.js");

/** Executes one parsed CLI command and returns JSON-serializable output. */
async function executeCommand(request) {
	const command = request.command.toLowerCase();
	if (command === "compile") return compileCommand(request);
	if (command === "verify") return verifyCommand(request);
	if (command === "inspect") return inspectCommand(request);
	if (command === "run") return runCommand(request);
	if (command === "targets") return { packaging: PACKAGING_PROFILES, targets: TARGET_PROFILES };
	if (command === "readiness") return readinessCommand(request);
	if (command === "doctor") return runDoctor();
	if (command === "package-android") return packageAndroidCommand(request);
	return { help: helpText(), ok: command === "help" };
}

/** Compiles one source tree into a canonical `.merkava` application. */
async function compileCommand({ flags, positionals }) {
	const project = required(positionals[0], "project_directory");
	const destination = required(positionals[1], "output_file");
	const files = readProjectFiles(project);
	const bytes = await compileCanonicalProject({
		capabilities: listFlag(flags.capabilities || flags.capability),
		entry: flags.entry || "/index.html",
		files,
		programEncoding: flags.encoding || "mapp-transition",
		targets: listFlag(flags.targets || flags.target)
	});
	const output = writeMerkavaFile(destination, bytes);
	return { bytes: bytes.length, files: Object.keys(files).length, ok: true, output };
}

/** Performs structural and semantic verification without executing code. */
function verifyCommand({ positionals }) {
	const bytes = readMerkavaFile(required(positionals[0], "merkava_file"));
	return verificationSummary(verifyCanonicalContainer(bytes));
}

/** Inspects canonical metadata and transitional program structure safely. */
function inspectCommand({ positionals }) {
	const bytes = readMerkavaFile(required(positionals[0], "merkava_file"));
	const result = inspectCanonicalProject(bytes);
	return safeSummary(result);
}

/** Executes a verified application using only explicitly granted capabilities. */
function runCommand({ flags, positionals }) {
	const bytes = readMerkavaFile(required(positionals[0], "merkava_file"));
	const result = runCanonicalProject(bytes, {
		availableCapabilities: listFlag(flags.capabilities || flags.capability)
	});
	return { ok: true, result: safeSummary(result) };
}


/** Packages canonical bytes into the deterministic unsigned Android bridge APK. */
async function packageAndroidCommand({ flags, positionals }) {
	const input = readMerkavaFile(required(positionals[0], "merkava_file"));
	const output = required(positionals[1], "apk_output");
	const result = await writeAndroidBridgeApk(input, output, {
		label: flags.label || "Merkava",
		packageName: flags.package || "com.awtsmoos.merkava"
	});
	return {
		bridge: true,
		bytes: result.bytes.length,
		ok: true,
		output: result.output,
		signed: result.evidence.signed
	};
}

/** Evaluates a JSON conformance-count document against release gates. */
function readinessCommand({ positionals }) {
	const path = positionals[0];
	const results = path ? JSON.parse(fs.readFileSync(path, "utf8")) : {};
	return evaluateConformance(results);
}

function required(value, name) { if (!value) throw new Error(`merkava_cli_missing:${name}`); return value; }
function helpText() { return "merkava <compile|verify|inspect|run|targets|readiness|doctor|package-android> ..."; }

module.exports = {
	executeCommand
};
