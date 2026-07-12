/**
 * B"H
 * @module HolyPlaces
 * @description Synagogue restoration and mitzvah actions connected to missions.
 */
import { State } from '../../binah/State.js';
import { recordMissionEvent } from '../../missions/MissionRuntime.js';
import { grantSkillExp } from '../skills/SkillRuntime.js';

export const healAtSynagogue = (label = 'Synagogue') => {
	State.Stats.light = State.Stats.maxLight;
	State.Stats.sparks += 1;
	grantSkillExp('binah', 10, label);
	grantSkillExp('niggun', 8, label);
	recordMissionEvent('HEAL', 'synagogue', { label, mapId: State.MapId });
	State.say(`${label}: light restored. A mitzvah spark enters your vessel.`, 420);
	return true;
};

export const doMitzvah = (name = 'Mitzvah') => {
	State.Stats.sparks += 2;
	grantSkillExp('learning', 8, name);
	grantSkillExp('daat', 8, name);
	State.Quests.counters.mitzvah = (State.Quests.counters.mitzvah || 0) + 1;
	recordMissionEvent('MITZVAH', 'mitzvah', { name, mapId: State.MapId });
	State.say(`${name}: shlichus fulfilled. +2 sparks.`, 420);
	return true;
};
