// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RouteClassification
 * @description
 * The Awtsmoos reveals many HTML chambers while their intended runtime contexts remain distinct;
 * Awtsmoos.com names public roads, fixtures, templates, legacy halls, and staging shadows so one release gate does not confuse every vessel with the same world.
 */

/**
 * @description Determines whether one normalized HTML path belongs to a laboratory, extension, example, hidden executor, or developer utility context.
 * @param {string} normalized - Slash-normalized source path beginning with `/`.
 * @returns {boolean} True when the route belongs to fixture scope rather than ordinary public web scope.
 */
function isFixturePath(normalized) {
	const fixtureDirectory = /\/(tests?|testing|experiments?|benchmarks?|samples?|examples?|tools?)\//i;
	const diagnosticFile = /(verification|_audit|\.geometry|debug|probe|renderer)\.html$/i;
	const hiddenPath = /\/(?:\.[^/]+)(?:\/|$)/;
	const scriptsTooling = /\/scripts\/tricks\//i;

	return fixtureDirectory.test(normalized)
		|| diagnosticFile.test(normalized)
		|| hiddenPath.test(normalized)
		|| scriptsTooling.test(normalized);
}

/**
 * @description Classifies one HTML source by the runtime in which it can be meaningfully executed.
 * @param {string} relativeFile - Project-relative path below the geelooy root.
 * @returns {'public'|'template'|'fixture'|'legacy'|'staging'} Stable route category.
 */
export function classifyRuntimeRoute(relativeFile) {
	const normalized = `/${relativeFile.replaceAll('\\', '/')}`;

	if (/(^|\/)\_awtsmoos\.|\/_awtsmoos\./.test(normalized)) {
		return 'template';
	}
	if (/\.awtsmoos-agent-transfer|\/\.tmp|\/tmp-|\/public\/virtual-os-games\//.test(normalized)) {
		return 'staging';
	}
	if (/\/(old|legacy)\/|index-old\.html$/i.test(normalized)) {
		return 'legacy';
	}
	if (isFixturePath(normalized)) {
		return 'fixture';
	}

	return 'public';
}
