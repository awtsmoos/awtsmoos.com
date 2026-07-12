/**
 * B"H
 * @module AbilityRuntime
 * @description Ability unlocks and battle move construction, led by the active Musag.
 */
import { State } from '../../binah/State.js';
import { AbilityIndex, BaseAbilityIds } from '../../data/abilities/AbilityIndex.js';
import { hasGarment } from '../equipment/EquipmentRuntime.js';
import { partyMoves } from '../party/PartyRuntime.js';

export const isAbilityUnlocked = ability => {
	if (!ability) return false;
	if (ability.unlockLevel && State.Stats.level < ability.unlockLevel) return false;
	if (ability.unlockQuest && !State.Quests.completed[ability.unlockQuest]) return false;
	if (ability.unlockGarment && !hasGarment(ability.unlockGarment)) return false;
	return true;
};

export const abilityList = () => BaseAbilityIds
	.map(id => AbilityIndex[id])
	.filter(isAbilityUnlocked);

export const quoteMove = (ability, routeIndex = 0, chapterIndex = 0, quoteIndex = 0) => {
	const route = ability.routes[Math.min(routeIndex, ability.routes.length - 1)];
	const chapter = route.chapters[Math.min(chapterIndex, route.chapters.length - 1)];
	const quote = chapter.quotes[Math.min(quoteIndex, chapter.quotes.length - 1)];
	return {
		id: ability.id,
		name: ability.name,
		category: ability.category,
		routeTitle: route.title,
		chapterTitle: chapter.title,
		routeQuote: quote.text,
		text: `${ability.text} ${quote.text}`,
		power: (ability.power || 0) + (quote.bonus || 0),
		heal: ability.heal || 0,
		scale: ability.scale || 'chochmah',
		path: { abilityId: ability.id, routeIndex, chapterIndex, quoteIndex }
	};
};

export const currentMoves = () => {
	const activeMoves = partyMoves();
	return activeMoves.length
		? activeMoves
		: abilityList().map(ability => quoteMove(ability));
};

export const abilitySummary = () => currentMoves().map(ability => ability.name);

export const routeSummary = () => abilityList().map(ability => {
	const learned = State.LearnedRoutes?.[ability.name] || 1;
	const route = ability.routes[Math.min(learned - 1, ability.routes.length - 1)];
	return `${ability.category}: ${route.title}`;
});

export const learnRouteFromMove = (move, won = false) => {
	if (!won || !move?.name) return null;
	State.LearnedRoutes ||= {};
	const ability = AbilityIndex[move.id];
	if (!ability) return null;
	const known = State.LearnedRoutes[move.name] || 1;
	if (known >= ability.routes.length) return null;
	State.LearnedRoutes[move.name] = known + 1;
	return `${move.name} learned route: ${ability.routes[known].title}`;
};
