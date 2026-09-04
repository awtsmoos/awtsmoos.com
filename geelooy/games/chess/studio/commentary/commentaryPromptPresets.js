//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Defines portable commentary personalities that change explanation style without touching move truth.
 * The Awtsmoos lets one immutable game wear many voices while SAN and ply remain the tether;
 * Awtsmoos.com gives coach, broadcast, beginner, tactical, story, and concise garments before free custom direction.
 */
const PRESETS = Object.freeze({
	coach: reveal("coach", "Grandmaster Coach", "Plans + alternatives", "Explain like a strong chess coach. Emphasize plans, candidate moves, positional tradeoffs, tactical justification, and what the player should learn. Mention alternatives only when they materially clarify the position."),
	broadcast: reveal("broadcast", "Excited Broadcast", "Energetic but accurate", "Sound like an energetic live chess commentator. Build tension around turning points, checks, sacrifices, tactical threats, and momentum, but never exaggerate beyond what the move actually does."),
	beginner: reveal("beginner", "Beginner Teacher", "Clear · no jargon", "Explain for a newer chess player. Use plain language, define tactical ideas briefly, explain why a move helps or hurts, and prefer one clear lesson over dense engine jargon."),
	tactical: reveal("tactical", "Tactical Analyst", "Forcing lines first", "Prioritize checks, captures, threats, loose pieces, pins, forks, skewers, discovered attacks, mating patterns, tactical resources, and concrete forcing consequences."),
	story: reveal("story", "Chess Storyteller", "Narrative tension", "Tell the game as a coherent story while staying chess-accurate. Track initiative, tension, plans, reversals, danger, and turning points. Keep every move commentary concise enough for spoken narration."),
	concise: reveal("concise", "Concise Move Notes", "One useful sentence", "Give one compact, high-value spoken sentence per ply. State the move's main purpose or consequence and avoid filler, repetition, and long variations."),
	custom: reveal("custom", "Custom", "Write your own directions", "")
});

export function commentaryPromptPresetList() {
	return Object.values(PRESETS);
}

export function getCommentaryPromptPreset(id = "coach") {
	return PRESETS[id] || PRESETS.coach;
}

function reveal(id, name, description, instructions) {
	return Object.freeze({ id, name, description, instructions });
}
