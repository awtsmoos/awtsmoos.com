//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file externalDependencyRules.cjs
 * @description
 * Detects runtime package and network-library dependencies with native Node only.
 * Awtsmoos source may depend on browser primitives, Node built-ins, and local files;
 * every other module specifier must become first-party source before release.
 */

const fs = require("node:fs");
const path = require("node:path");
const { builtinModules } = require("node:module");

const BUILTINS = new Set(builtinModules.flatMap(name => {
	return [name, name.replace(/^node:/, ""), `node:${name.replace(/^node:/, "")}`];
}));
const PACKAGE_FIELDS = [
	"dependencies",
	"devDependencies",
	"optionalDependencies",
	"peerDependencies"
];

/**
 * Audits one JavaScript source file for non-native module specifiers.
 *
 * @param {string} filePath JavaScript source path.
 * @returns {object[]} Dependency violations.
 */
function auditJavaScriptDependencies(filePath) {
	const source = fs.readFileSync(filePath, "utf8");
	const specifiers = moduleSpecifiers(source);
	return specifiers
		.filter(isExternalSpecifier)
		.map(specifier => ({
			code: "external_module_dependency",
			detail: specifier
		}));
}

/**
 * Audits dependency declarations in one package manifest.
 *
 * @param {string} filePath package.json path.
 * @returns {object[]} Declared external package violations.
 */
function auditPackageDependencies(filePath) {
	const manifest = JSON.parse(fs.readFileSync(filePath, "utf8"));
	const violations = [];
	for (const field of PACKAGE_FIELDS) {
		for (const name of Object.keys(manifest[field] || {})) {
			violations.push({
				code: "declared_external_package",
				detail: `${field}:${name}`
			});
		}
	}
	return violations;
}

/** @param {string} source JavaScript source. @returns {string[]} Literal module specifiers. */
function moduleSpecifiers(source) {
	const found = new Set();
	const patterns = [
		/\b(?:import|export)\s+(?:[^"']*?\s+from\s+)?["']([^"']+)["']/g,
		/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
		/\brequire\s*\(\s*["']([^"']+)["']\s*\)/g
	];
	for (const pattern of patterns) {
		for (const match of source.matchAll(pattern)) {
			found.add(match[1]);
		}
	}
	return [...found];
}

/** @param {string} specifier Module specifier. @returns {boolean} True for forbidden non-local dependencies. */
function isExternalSpecifier(specifier) {
	const value = String(specifier || "").trim();
	if (!value || value.startsWith(".") || value.startsWith("/")) {
		return false;
	}
	if (BUILTINS.has(value)) {
		return false;
	}
	if (/^(?:data:|blob:)/i.test(value)) {
		return false;
	}
	return true;
}

/** @param {string} filePath Any source path. @returns {object[]} Dependency violations. */
function auditExternalDependencies(filePath) {
	const extension = path.extname(filePath).toLowerCase();
	if (path.basename(filePath) === "package.json") {
		return auditPackageDependencies(filePath);
	}
	if ([".js", ".mjs", ".cjs"].includes(extension)) {
		return auditJavaScriptDependencies(filePath);
	}
	return [];
}

module.exports = {
	auditExternalDependencies,
	auditJavaScriptDependencies,
	auditPackageDependencies,
	isExternalSpecifier,
	moduleSpecifiers
};
