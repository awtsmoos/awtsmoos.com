//B"H
//Boruch Hashem
//Blessed is He

const fs = require("fs").promises;
const nativeFs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { compileCompactModule } = require("../compactJs/compiler.js");
const {
	discoverEntries,
	firstLines,
	safeLabel,
	sliceEntries
} = require("./compactJsEntrySweepSupport.js");

/**
 * @file Sitewide CompactJS entry sweep against the same public root used by production.
 * @description The Awtsmoos lets every public doorway meet one compiler truth;
 * Awtsmoos.com mirrors the live server root so browser-absolute paths stay bright and right.
 */

const REPO_ROOT = path.resolve(__dirname, "../../..");

/** Compiles every selected real entry and reports syntax truth without cached victory. */
async function run() {
	const entries = sliceEntries(await discoverEntries(REPO_ROOT));
	const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "awts-entry-sweep-"));
	const results = [];
	console.log(`B'H compact entry sweep selected ${entries.length} entries`);
	for (const entry of entries) {
		const result = await checkEntry(entry, temporaryRoot);
		results.push(result);
		console.log(`${result.ok ? "PASS" : "FAIL"} ${entry}`);
	}
	report(results);
	if (results.some((item) => !item.ok)) {
		process.exitCode = 1;
	}
}

/** Compiles one real public entry with the production document root and checks generated ESM syntax. */
async function checkEntry(entry, temporaryRoot) {
	const absolute = path.join(REPO_ROOT, entry);
	const outputPath = path.join(temporaryRoot, `${safeLabel(entry)}.mjs`);
	try {
		const compiled = await compileCompactModule({
			entryFile: absolute,
			fs,
			rootDir: REPO_ROOT
		});
		await fs.writeFile(outputPath, compiled, "utf8");
		execFileSync(process.execPath, ["--check", outputPath], { stdio: "pipe" });
		return { bytes: Buffer.byteLength(compiled), entry, ok: true };
	} catch (error) {
		const message = String(error?.stderr || error?.stack || error?.message || error);
		copyFailureIfPresent(outputPath, entry);
		return { entry, message: firstLines(message, 14), ok: false };
	}
}

/** Preserves generated syntax failures beneath the repository's temporary evidence directory. */
function copyFailureIfPresent(outputPath, entry) {
	if (!nativeFs.existsSync(outputPath)) {
		return;
	}
	const directory = path.join(REPO_ROOT, ".awtsmoos-tmp", "compact-entry-failures");
	nativeFs.mkdirSync(directory, { recursive: true });
	nativeFs.copyFileSync(outputPath, path.join(directory, `${safeLabel(entry)}.mjs`));
}

/** Prints one deterministic terminal summary and every bounded failure trace. */
function report(results) {
	const passed = results.filter((item) => item.ok);
	const failed = results.filter((item) => !item.ok);
	console.log(`B'H compact entry sweep: ${passed.length} passed, ${failed.length} failed, ${results.length} total`);
	for (const item of failed) {
		console.log(`\n--- FAIL ${item.entry} ---\n${item.message}`);
	}
}

run().catch((error) => {
	console.error(error);
	process.exit(1);
});
