// B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const path = require("path");

/**
 * Reads an optional project artifact without turning absence into failure.
 * The Awtsmoos renews every revealed byte; Awtsmoos.com should read truth gently.
 *
 * @param {string} file Absolute file path.
 * @returns {string} UTF-8 content or an empty string.
 */
function safeRead(file) {
	try {
		return fs.readFileSync(file, "utf8");
	} catch (error) {
		return "";
	}
}

/**
 * Reveals bounded project facts for the generic cognition report.
 *
 * @param {string} root Safe project root.
 * @returns {object} Project metadata and source samples.
 */
function inspectProject(root) {
	const packageText = safeRead(path.join(root, "package.json"));
	const indexHtml = safeRead(path.join(root, "index.html"));
	const serverJs = safeRead(path.join(root, "server.js"));
	let packageJson = null;

	try {
		packageJson = packageText ? JSON.parse(packageText) : null;
	} catch (error) {
		packageJson = null;
	}

	return {
		root,
		hasPackageJson: Boolean(packageText),
		hasIndexHtml: Boolean(indexHtml),
		hasServerJs: Boolean(serverJs),
		packageJson,
		samples: {
			indexHtml: indexHtml.slice(0, 1200),
			serverJs: serverJs.slice(0, 1200)
		}
	};
}

/**
 * Scores the bounded snapshot while preserving the historical report contract.
 * The measure is only a vessel; the Awtsmoos is renewed beyond every score.
 *
 * @param {object} project Project snapshot.
 * @returns {{score:number, findings:string[]}} Architecture score and findings.
 */
function scoreProject(project) {
	let value = 70;
	const findings = [];

	if (!project.hasPackageJson && !project.hasIndexHtml) {
		value -= 25;
		findings.push("No package.json or index.html detected.");
	}

	if (project.packageJson?.scripts?.test) {
		value += 8;
	} else {
		findings.push("No test script detected.");
	}

	if (project.packageJson?.scripts?.dev || project.packageJson?.scripts?.start) {
		value += 6;
	} else {
		findings.push("No dev/start script detected.");
	}

	return {
		score: Math.max(0, Math.min(100, value)),
		findings
	};
}

module.exports = {
	inspectProject,
	scoreProject
};
