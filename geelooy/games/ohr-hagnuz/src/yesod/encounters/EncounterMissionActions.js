/**
 * B"H
 * @module EncounterMissionActions
 * @description Converts physical world interactions into ordered mission events.
 */
import { State } from '../../binah/State.js';
import { currentObjective, recordMissionEvent } from '../../missions/MissionRuntime.js';
import { harvestNode } from '../gathering/GatheringRuntime.js';

export const recordTalk = glyph => recordMissionEvent('TALK', glyph, { mapId: State.MapId });
export const recordDelivery = target => recordMissionEvent('DELIVER', target, { mapId: State.MapId });

export const recordInspection = meta => {
	const target = meta.book || meta.questItem || meta.gift;
	return target ? recordMissionEvent('INSPECT', target, { mapId: State.MapId }) : { matched: false };
};

export const tryGatherObjective = meta => {
	const objective = currentObjective();
	if (objective?.type !== 'GATHER') return false;
	const allowed = {
		parchment_reed: ['grass', 'object', 'tree'],
		orchard_fig_tree: ['tree', 'gift'],
		spark_stone: ['object', 'wall', 'ohr-wall']
	}[objective.target] || [];
	if (!allowed.includes(meta.kind)) return false;
	const result = harvestNode(objective.target);
	if (result.ok) State.say(`${result.node.name}: gathered ${result.amount} ${result.node.item}.`, 320);
	return result.ok;
};

export const tryPuzzleObjective = (front, meta) => {
	const objective = currentObjective();
	if (objective?.type !== 'PUZZLE') return false;
	if (['floor', 'road', 'grass', 'edge', 'door'].includes(meta.kind)) return false;
	const validMap = {
		separation_mirrors: 'Hall_Of_Separation',
		blessing_order: 'House_Of_Forgetting',
		lesson_fragments: 'House_Of_Forgetting'
	}[objective.target];
	if (validMap && validMap !== State.MapId) return false;
	recordMissionEvent('PUZZLE', objective.target, { mapId: State.MapId, glyph: front.tile });
	State.say(`${objective.description} The symbol ${front.tile} entered its proper place.`, 480);
	return true;
};

const narrativeDeliveryValid = (target, glyph, meta) => ({
	jerusalem_caravan: State.MapId === 'Jerusalem_Ascent',
	stolen_niggun: State.MapId === 'Market_Of_Exchange' && glyph === 'D',
	rescued_students: State.MapId === 'House_Of_Forgetting' && glyph === 'ג'
}[target] || false) && ['npc', 'receiver'].includes(meta.kind);

export const tryNarrativeDelivery = (glyph, meta) => {
	const objective = currentObjective();
	if (objective?.type !== 'DELIVER') return false;
	if (!narrativeDeliveryValid(objective.target, glyph, meta)) return false;
	recordDelivery(objective.target);
	State.say(`${objective.description} Delivery witnessed by ${glyph}.`, 420);
	return true;
};
