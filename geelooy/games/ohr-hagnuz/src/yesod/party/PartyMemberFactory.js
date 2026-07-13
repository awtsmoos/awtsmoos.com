// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PartyMemberFactory.js
 * @description Creates and normalizes persistent Nitzotz party members.
 *
 * A companion is more than battle numbers: habitat, temperament, care, and
 * purpose travel with the name. The Awtsmoos renews the living source while
 * this vessel preserves the player's earned relationship across roads and
 * saves, under the wider horizon of Awtsmoos.com.
 */
import { mergeNitzotzMetadata } from '../../content/nitzotzos/NitzotzCatalog.js';
import { normalizeBattleMoves } from '../battle/BattleCommandRules.js';
import { bondStage, clampBond } from './NitzotzBondRules.js';

const clone = value => JSON.parse(JSON.stringify(value));
const cleanName = source => source.name?.replace(/^Wild Musag:\s*/, '') || source.id;

export const partyNextExp = level => Math.floor(40 * Math.pow(1.32, Math.max(0, level - 1)));

const fallbackMoves = source => {
	const id = source.speciesId || source.id;
	const name = cleanName(source);
	const element = source.element || 'Mystery';
	const teaching = source.teaching || source.lesson || 'Every spark reveals a road when returned to its purpose.';
	return normalizeBattleMoves([
		{ id: `${id}_insight`, name: `${element} Insight`, category: 'Mishnah', power: 15, text: teaching, routeQuote: teaching },
		{ id: `${id}_echo`, name: `${name} Echo`, category: 'Chassidus', power: 7, text: `Listen for the inner spark of ${name}.` },
		{ id: `${id}_shelter`, name: 'Sheltering Vessel', category: 'Rambam', power: 0, guardStrength: 0.5, text: 'Stand firm without closing the heart.' },
		{ id: `${id}_rest`, name: 'Resting Current', category: 'Niggun', power: 8, heal: 11, text: 'A quiet melody restores courage.' }
	]);
};

const sourceMoves = source => source.moves?.length
	? normalizeBattleMoves(clone(source.moves))
	: fallbackMoves(source);

export const createPartyMember = rawSource => {
	const source = mergeNitzotzMetadata(rawSource) || rawSource;
	const bond = clampBond(source.bond || 0);
	return {
		id: source.id || source.speciesId,
		name: cleanName(source),
		glyph: source.glyph || '◇',
		element: source.element || 'Mystery',
		pardesAffinity: clone(source.pardesAffinity || []),
		role: source.role || source.teaching || source.lesson || 'A living road companion',
		habitat: source.habitat || source.region || 'An undiscovered road',
		temperament: source.temperament || 'Still being learned',
		passive: source.passive || 'A concealed trait awaits trust.',
		explorationAbility: clone(source.explorationAbility || null),
		preferredCare: source.preferredCare || 'Quiet camp companionship',
		personalShlichus: source.personalShlichus || 'A personal road has not yet opened.',
		level: Math.max(1, Number(source.level || 1)),
		exp: Math.max(0, Number(source.exp || 0)),
		nextExp: Math.max(1, Number(source.nextExp || partyNextExp(source.level || 1))),
		bond,
		bondStage: bondStage(bond).name,
		moves: sourceMoves(source),
		evolution: source.evolution || null,
		evolutionStages: clone(source.evolutionStages || [])
	};
};

export const normalizePartyMember = member => ({
	...createPartyMember(member),
	...member,
	bond: clampBond(member?.bond || 0),
	bondStage: bondStage(member?.bond || 0).name,
	moves: sourceMoves(mergeNitzotzMetadata(member) || member)
});
