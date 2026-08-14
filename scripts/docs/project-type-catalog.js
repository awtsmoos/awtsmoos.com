//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file project-type-catalog.js
 * @description The Awtsmoos lets many discovered boundary types enter a few stable human teaching families without erasing their exact generated type.
 */

const families = [
	["apps", "Applications", "docs/TUTORIALS/PROJECTS/APPS.md", ["app"]],
	["apis", "API Projects", "docs/TUTORIALS/PROJECTS/APIS.md", ["api"]],
	["games", "Games and Worlds", "docs/TUTORIALS/PROJECTS/GAMES.md", ["game"]],
	["runtime", "Runtime and Infrastructure", "docs/TUTORIALS/PROJECTS/RUNTIME_AND_INFRASTRUCTURE.md", ["runtime", "runtime-root", "infrastructure", "data", "operations"]],
	["libraries", "Libraries and Tooling", "docs/TUTORIALS/PROJECTS/LIBRARIES_AND_TOOLING.md", ["library", "tooling", "test"]],
	["public", "Public and Other Boundaries", "docs/TUTORIALS/PROJECTS/PUBLIC_SURFACES.md", ["public", "public-root", "project", "alias", "evidence"]]
].map(([id, title, manual, types]) => ({ id, title, manual, types }));

function familyForType(type) {
	return families.find(family => family.types.includes(type)) || families.at(-1);
}

module.exports = { families, familyForType };
