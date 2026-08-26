//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RouteSourceScanner
 * @description
 * The Awtsmoos renews every doorway whether it lives in a root route file or a smaller modular chamber;
 * Awtsmoos.com lets Binah discover route-bearing source recursively so test truth follows architecture instead of freezing yesterday's folder map forever.
 */
const fs = require('fs');
const path = require('path');

class RouteSourceScanner {
	/** @param {string} socialRoot Absolute or repository-relative social API root. */
	constructor(socialRoot) {
		this.socialRoot = socialRoot;
	}

	/**
	 * Finds JavaScript files outside test trees that actually declare route-key literals.
	 * @returns {Array<{file:string,source:string,routes:Array<{route:string,line:number}>}>} Route-bearing sources.
	 */
	discover() {
		return this.walk(this.socialRoot)
			.filter(file => file.endsWith('.js'))
			.filter(file => !this.isTestPath(file))
			.map(file => this.describe(file))
			.filter(record => record.routes.length > 0);
	}

	/** @param {string} directory Directory to walk. @returns {string[]} Descendant file paths. */
	walk(directory) {
		const entries = fs.readdirSync(directory, { withFileTypes: true });
		const files = [];
		for (const entry of entries) {
			const child = path.join(directory, entry.name);
			if (entry.isDirectory()) {
				files.push(...this.walk(child));
				continue;
			}
			files.push(child);
		}
		return files;
	}

	/** @param {string} file Candidate file. @returns {boolean} Whether the path belongs to tests. */
	isTestPath(file) {
		const normalized = file.split(path.sep).join('/');
		return normalized.includes('/test/') || normalized.includes('/tests/');
	}

	/** @param {string} file Route-bearing candidate. @returns {Object} Source description. */
	describe(file) {
		const source = fs.readFileSync(file, 'utf8');
		return {
			file,
			source,
			routes: RouteSourceScanner.routeKeys(source)
		};
	}

	/**
	 * Extracts object-literal route keys and source line numbers.
	 * @param {string} source JavaScript source.
	 * @returns {Array<{route:string,line:number}>} Route declarations.
	 */
	static routeKeys(source) {
		const routes = [];
		for (const [index, line] of source.split('\n').entries()) {
			const match = line.match(/^\s*["'`]([^"'`]+)["'`]\s*:/);
			if (match?.[1]?.startsWith('/')) {
				routes.push({ route: match[1], line: index + 1 });
			}
		}
		return routes;
	}
}

module.exports = {
	RouteSourceScanner
};
