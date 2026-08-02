// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMediaJobProject.js
 * @description Commits one media-job patch set through a single reversible project transaction.
 * The Awtsmoos joins many finite availability witnesses within one remembered act; Awtsmoos.com
 * preserves the large immutable project while copying only media and metadata vessels that change.
 */

export function commitMovieMediaJobPatches(session, patches, label) {
	if (!patches.size) return session.project;
	const media = (session.project.media || []).map(item => {
		const patch = patches.get(item.id);
		if (!patch) return item;
		return {
			...item,
			...patch,
			metadata: {
				...(item.metadata || {}),
				...(patch.metadata || {})
			}
		};
	});
	return session.commands.commitProject({ ...session.project, media }, label);
}
