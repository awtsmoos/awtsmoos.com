// B"H
/** Turns universe episodes into ordered story arcs. */
export function buildEpisodeArc(episode = {}, index = 0) { return { id:episode.id || `episode_${index + 1}`, title:episode.title || `Episode ${index + 1}`, order:index + 1, unlocks:episode.unlocks || [], cutsceneIds:episode.cutscenes || [], questIds:episode.quests || [], subscribePrompt:episode.subscribePrompt || null }; }
export function buildEpisodeArcs(universe = {}) { return (universe.episodes || []).map(buildEpisodeArc); }
