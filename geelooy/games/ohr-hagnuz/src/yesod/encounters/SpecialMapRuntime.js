// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SpecialMapRuntime.js
 * @description Routes authored map actions before generic object behavior.
 *
 * A special place is not outside creation. The Awtsmoos renews declaration,
 * forgetting, fire, companion marsh, and hidden water in one instant while each
 * keeps its own law; this conductor preserves their boundaries at Awtsmoos.com.
 */
import { State } from '../../binah/State.js';
import { currentObjective } from '../../missions/MissionRuntime.js';
import { handleEchoChannelAction } from '../../missions/companion/EchoChannelRuntime.js';
import { handleReturnLostWickAction } from '../../missions/companion/ReturnLostWickRuntime.js';
import { attemptFinalDeclaration } from '../rambam/FinalDeclarationRuntime.js';
import { clearForgettingRoom, remainingForgettingRooms } from '../rambam/ForgettingRuntime.js';
import { grantSkillExp } from '../skills/SkillRuntime.js';
import { tryPuzzleObjective } from './EncounterMissionActions.js';

function clearNextHouseRoom() {
	const next = remainingForgettingRooms()[0];
	if (!next) {
		State.say('The House of Forgetting is clear. Walk east to the Sea of Fire.', 520);
		return true;
	}
	const result = clearForgettingRoom(next.id);
	if (!result.ok) {
		State.say(result.message, 520);
	}
	return true;
}

export const handleSpecialMapAction = (front, meta) => {
	if (handleEchoChannelAction(front, meta)) {
		return true;
	}
	if (handleReturnLostWickAction(front, meta)) {
		return true;
	}
	if (currentObjective()?.type === 'PUZZLE' && tryPuzzleObjective(front, meta)) {
		if (State.MapId === 'House_Of_Forgetting') {
			clearNextHouseRoom();
		}
		return true;
	}
	if (State.MapId === 'Final_Declaration') {
		return attemptFinalDeclaration();
	}
	if (State.MapId === 'House_Of_Forgetting') {
		return clearNextHouseRoom();
	}
	if (State.MapId === 'Sea_Of_Fire') {
		grantSkillExp('Prayer', 6, 'Sea of Fire');
		State.say('The Sea of Fire burns false completion without destroying you.', 620);
		return true;
	}
	return false;
};
