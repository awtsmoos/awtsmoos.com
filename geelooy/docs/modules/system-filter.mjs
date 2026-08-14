//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file system-filter.mjs
 * @description The Awtsmoos lets Data, Security, and Realtime systems be filtered by district and observable evidence while curated meaning remains distinct from generated counts.
 */

function textMatch(system, query) {
	if (!query) return true;
	const haystack = [
		system.systemId,
		system.title,
		system.summary,
		system.claimsBoundary,
		system.changeRisk,
		...(system.tags || []),
		...(system.manuals || []),
		...(system.sources || []),
		...(system.projects || []).flatMap(project => [project.path, project.title])
	].join(" ").toLowerCase();
	return query.toLowerCase().split(/\s+/).filter(Boolean).every(term => haystack.includes(term));
}

function evidenceMatch(system, evidence) {
	if (!evidence) return true;
	if (evidence === "environment") return Boolean(system.environmentEvidence?.length);
	if (evidence === "application") return Boolean(system.realtimeApplications?.length);
	if (evidence === "event") return Boolean(system.eventEvidence?.length);
	if (evidence === "project") return Boolean(system.projects?.length);
	return true;
}

export function filterSystems(systems, state = {}) {
	return systems.filter(system => {
		if (state.systemDistrict && system.district !== state.systemDistrict) return false;
		if (!textMatch(system, state.systemq || "")) return false;
		return evidenceMatch(system, state.systemEvidence || "");
	}).sort((a, b) => a.district.localeCompare(b.district) || a.title.localeCompare(b.title));
}

export function districtCounts(systems) {
	const counts = new Map();
	for (const system of systems) counts.set(system.district, (counts.get(system.district) || 0) + 1);
	return counts;
}
