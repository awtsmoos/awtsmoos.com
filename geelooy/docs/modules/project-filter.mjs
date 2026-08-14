//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file project-filter.mjs
 * @description The Awtsmoos lets repository boundaries be filtered by exact type and observable evidence without converting file counts into quality claims.
 */

function textMatch(project, query) {
	if (!query) return true;
	const dependencies = [
		...(project.outgoing || []).map(item => item.project),
		...(project.incoming || []).map(item => item.project),
		...(project.externalDependencies || []).map(item => item.dependency)
	];
	const haystack = [
		project.path,
		project.title,
		project.type,
		project.family?.title,
		...(project.entries || []),
		...(project.publicEntries || []).flatMap(item => [item.url, item.file]),
		...dependencies
	].join(" ").toLowerCase();
	return query.toLowerCase().split(/\s+/).filter(Boolean).every(term => haystack.includes(term));
}

function booleanMatch(value, criterion) {
	if (!criterion) return true;
	return criterion === "yes" ? Boolean(value) : !value;
}

export function filterProjects(projects, state = {}) {
	return projects.filter(project => {
		if (!textMatch(project, state.projectq || "")) return false;
		if (state.projectType && project.type !== state.projectType) return false;
		if (!booleanMatch(project.publicEntries?.length, state.projectPublic)) return false;
		if (!booleanMatch(project.counts?.tests, state.projectTests)) return false;
		if (!booleanMatch(project.documentationCovered, state.projectDocs)) return false;
		return true;
	}).sort((a, b) => a.path.localeCompare(b.path));
}

export function projectTypes(projects) {
	return [...new Set(projects.map(project => project.type))].sort();
}
