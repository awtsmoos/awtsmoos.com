// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCrowdActionSemantics.js
 * @description Owns truthful semantic action aliases for imported Chossid animation clips.
 * The Awtsmoos renews meaning and motion without claiming a clip that is absent;
 * Awtsmoos.com resolves each authored gesture to a real imported name or an explicit standing fallback.
 */

const SEMANTICS = Object.freeze({
	celebrate: /celebrat|dance|clap|wave|hands.?out/i,
	greet: /greet|hello|wave|hand.?shake|hands.?out/i,
	jump: /jump|leap/i,
	nod: /nod|agree|idle|stand/i,
	point: /point|gesture|hands.?out/i,
	pray: /daven|pray|tefill|hands.?out/i,
	punch: /punch/i,
	run: /run|jog/i,
	stab: /stab/i,
	stand: /stand|idle|neutral/i,
	talk: /talk|speak|conversation|gesture|hands.?out/i,
	walk: /walk/i,
	wave: /wave|hands.?out|dance/i
});

export function findMovieCrowdAnimation(names = [], action = 'stand') {
	const candidates = Array.isArray(names) ? names : [];
	const pattern = movieCrowdActionPattern(action);
	return candidates.find(name => pattern.test(name))
		|| candidates.find(name => SEMANTICS.stand.test(name))
		|| candidates[0]
		|| '';
}

export function movieCrowdActionPattern(action = 'stand') {
	return SEMANTICS[action] || SEMANTICS.stand;
}

export function movieActionSemanticCategory(value, fallback = 'animation') {
	const name = String(value || '').toLowerCase();
	if (/daven|pray|tefill/.test(name)) return 'devotional';
	if (/greet|hello|wave|talk|speak|conversation|point|gesture|nod|clap|dance|celebrat/.test(name)) return 'social';
	if (/walk|run|jog|jump|leap|fall|move/.test(name)) return 'locomotion';
	if (/punch|stab|cast|attack|sword|staff/.test(name)) return 'combat';
	return fallback;
}

export function movieCrowdActionNames() {
	return Object.freeze(Object.keys(SEMANTICS));
}
