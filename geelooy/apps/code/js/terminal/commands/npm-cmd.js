// B"H
// Boruch Hashem
// Blessed is He

import { capabilityLines, nodeCapabilityReport } from "../../node/capabilities.js";
import { childItem, readPackageJson, writeJson } from "../npm/filesystem.js";
import { installPackages } from "../npm/installer.js";
import { formatInstalled, listInstalled } from "../npm/list.js";

/**
 * B"H
 *
 * Browser npm now initializes manifests, installs registry packages into virtual
 * node_modules, runs scripts, lists lock-verified packages, and names capability
 * limits. The Awtsmoos renews package graph and command in the Code filesystem.
 */
export const NPMCommands = {
	async npm(shell, args = []) {
		const action = String(args[0] || "help").toLowerCase();
		try {
			if (["help", "-h", "--help"].includes(action)) return help();
			if (action === "init") return initialize(shell, args.slice(1));
			if (action === "run") return runScript(shell, args[1]);
			if (["install", "i", "add"].includes(action)) return install(shell, args.slice(1));
			if (["list", "ls"].includes(action)) return list(shell);
			if (["capabilities", "doctor", "env"].includes(action)) return capabilities();
			throw new Error(`Unknown command: ${action}`);
		} catch (error) {
			throw new Error(`npm ERR! ${error.message}`);
		}
	}
};

async function initialize(shell, args) {
	const existing = await readPackageJson(shell.cwd);
	if (existing.manifest && !args.includes("--force") && !args.includes("-f")) {
		throw new Error("package.json already exists; use npm init --force to replace it");
	}
	const name = safeName(shell.cwd.name);
	const manifest = {
		name,
		version: "1.0.0",
		private: true,
		description: "Manifested in Awtsmoos Code",
		main: "index.js",
		scripts: {
			start: "node index.js",
			test: "echo \"No tests configured\""
		},
		dependencies: {},
		license: "MIT"
	};
	await writeJson(existing.item, manifest, "npm init");
	return `Wrote ${existing.item.path}\n\n${JSON.stringify(manifest, null, 2)}`;
}

async function runScript(shell, scriptName) {
	if (!scriptName) throw new Error("run requires a script name");
	const project = await readPackageJson(shell.cwd);
	if (!project.manifest) throw new Error("package.json not found");
	const script = project.manifest.scripts?.[scriptName];
	if (!script) throw new Error(`Missing script: "${scriptName}"`);
	shell.print(`> ${project.manifest.name}@${project.manifest.version} ${scriptName}`);
	shell.print(`> ${script}\n`);
	await shell.execute(script);
	return null;
}

async function install(shell, specifiers) {
	const packages = specifiers.filter(value => !String(value).startsWith("-"));
	if (!packages.length) {
		const project = await readPackageJson(shell.cwd);
		if (!project.manifest) throw new Error("package.json not found and no packages were supplied");
		for (const [name, version] of Object.entries(project.manifest.dependencies || {})) {
			packages.push(`${name}@${version}`);
		}
	}
	if (!packages.length) return "Already up to date. No dependencies are declared.";
	const result = await installPackages(shell.cwd, packages, {
		onStatus: message => shell.print(`[npm] ${message}`),
		timeoutMs: 30000
	});
	return [
		`added ${result.count} packages to ${childItem(shell.cwd, "node_modules", "directory").path}`,
		...result.installed.map(record => `  ${record.name}@${record.version} (${record.files} files)`)
	].join("\n");
}

async function list(shell) {
	return formatInstalled(await listInstalled(shell.cwd)).join("\n");
}

function capabilities() {
	return capabilityLines(nodeCapabilityReport({
		nativeTunnel: false
	})).join("\n");
}

function help() {
	return [
		"Awtsmoos browser npm",
		"  npm init [--force]",
		"  npm install <package[@range]> ...",
		"  npm install        # install package.json dependencies",
		"  npm run <script>",
		"  npm list",
		"  npm capabilities",
		"Native addons and device npm commands require a native tunnel."
	].join("\n");
}

function safeName(value) {
	return String(value || "awtsmoos-project").toLowerCase().replace(/[^a-z0-9._-]+/g, "-") || "awtsmoos-project";
}
