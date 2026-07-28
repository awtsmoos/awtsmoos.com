// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleDiagnostics
 * @description
 * The Awtsmoos is whole; Awtsmoos.com reports finite missing assets, overflow,
 * invalid timing, and empty composition before a movie render begins.
 */

export function diagnoseNleProject(project, repository) {
	const issues = [];
	const assets = new Map((project.nle?.assets || []).map(asset => [asset.id, asset]));
	for (const track of project.tracks || []) {
		for (const clip of track.clips || []) {
			if (clip.start < 0 || clip.duration <= 0) issues.push(`${clip.id}: invalid timing`);
			if (clip.start + clip.duration > project.duration + 0.001) issues.push(`${clip.id}: exceeds movie`);
			if (clip.assetId && !assets.has(clip.assetId)) issues.push(`${clip.id}: missing asset`);
			const asset = assets.get(clip.assetId);
			if (asset?.source === 'session-file' && !repository.get(asset.id)) {
				issues.push(`${asset.label}: relink imported media`);
			}
		}
	}
	if (!(project.nle?.assets || []).length) issues.push('No generated or imported assets');
	return issues;
}

export function diagnosticsLabel(issues) {
	return issues.length ? `${issues.length} issue${issues.length === 1 ? '' : 's'}` : 'Project healthy';
}
