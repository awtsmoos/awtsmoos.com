/**
 * B"H
 * @module PartyMemberFactory
 * @description Creates starter and encountered Musag members with distinct move kits.
 */
const clone = value => JSON.parse(JSON.stringify(value));
const cleanName = source => source.name?.replace(/^Wild Musag:\s*/, '') || source.id;

export const partyNextExp = level => Math.floor(40 * Math.pow(1.32, Math.max(0, level - 1)));

const move = (id, name, category, power, quote, extra = {}) => ({
	id,
	name,
	category,
	power,
	routeTitle: extra.routeTitle || 'Living Concept',
	chapterTitle: extra.chapterTitle || 'Sweetening',
	routeQuote: quote,
	text: quote,
	heal: extra.heal || 0,
	scale: extra.scale || 'chochmah'
});

const encounterMoves = source => {
	const id = source.speciesId || source.id;
	const name = cleanName(source);
	const element = source.element || 'Mystery';
	const teaching = source.teaching || source.lesson || 'Every concept reveals a path when returned to its root.';
	return [
		move(`${id}_insight`, `${element} Insight`, 'Mishnah', 15, teaching),
		move(`${id}_echo`, `${name} Echo`, 'Chassidus', 17, `The inner spark of ${name} answers without fear.`),
		move(`${id}_pulse`, `${element} Pulse`, 'Kabbalah', 20, `${element} enters an ordered vessel.`),
		move(`${id}_rest`, 'Resting Vessel', 'Niggun', 8, 'A quiet melody restores the companion.', { heal: 11 })
	];
};

const sourceMoves = source => source.moves?.length ? source.moves : encounterMoves(source);

export const createPartyMember = source => ({
	id: source.id || source.speciesId,
	name: cleanName(source),
	glyph: source.glyph || '◇',
	element: source.element || 'Mystery',
	role: source.role || source.teaching || source.lesson || 'A living concept',
	level: 1,
	exp: 0,
	nextExp: partyNextExp(1),
	bond: 0,
	moves: clone(sourceMoves(source)),
	evolution: null
});
