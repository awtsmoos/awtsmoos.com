/**
 * B"H
 * @module SceneRuntime
 * @description Deterministic scene beats, choices, starter selection, and endings.
 */
import { State } from '../binah/State.js';
import { campaignSceneById } from '../content/CampaignScenes.js';
import { chooseStarter } from '../yesod/party/PartyRuntime.js';
import { recordMissionEvent } from '../missions/MissionRuntime.js';

const activeScene = () => campaignSceneById(State.Scenes.activeId);
const activeBeat = () => activeScene()?.beats?.[State.Scenes.lineIndex] || null;

const showBeat = () => {
	const beat = activeBeat();
	if (!beat) return finishScene();
	State.openDialogue({
		glyph: beat.glyph || '✦',
		label: beat.speaker || 'Narrator',
		lines: [beat.text],
		choices: beat.choices || [],
		mode: 'scene',
		sceneId: State.Scenes.activeId,
		sceneIndex: State.Scenes.lineIndex,
		sceneTotal: activeScene().beats.length
	});
};

export const startScene = (id, purpose = 'story') => {
	const scene = campaignSceneById(id);
	if (!scene) return false;
	State.Scenes.activeId = id;
	State.Scenes.lineIndex = 0;
	State.Scenes.purpose = purpose;
	showBeat();
	return true;
};

export const finishScene = () => {
	const id = State.Scenes.activeId;
	if (!id) return false;
	State.Scenes.completed[id] = true;
	State.Scenes.history.unshift({ id, completedAt: Date.now() });
	State.Scenes.activeId = null;
	State.Scenes.lineIndex = 0;
	State.Scenes.purpose = null;
	State.closeDialogue(false);
	return true;
};

export const advanceScene = () => {
	if (!State.Scenes.activeId) return false;
	if (activeBeat()?.choices?.length) return false;
	State.Scenes.lineIndex += 1;
	showBeat();
	return true;
};

const applyChoice = choice => {
	if (choice.action === 'starter') {
		const result = chooseStarter(choice.value);
		if (result.ok) recordMissionEvent('STARTER', choice.value);
	}
	if (choice.action === 'missionChoice') recordMissionEvent('CHOICE', choice.value);
	if (choice.action === 'ending') {
		State.Campaign.ending = choice.value;
		recordMissionEvent('CHOICE', 'ending_path', { value: choice.value });
	}
};

export const chooseSceneChoice = choiceId => {
	const choice = activeBeat()?.choices?.find(entry => entry.id === choiceId);
	if (!choice) return false;
	State.Scenes.choices[State.Scenes.activeId] = choice.id;
	applyChoice(choice);
	State.Scenes.lineIndex += 1;
	showBeat();
	return true;
};

export const sceneChoices = () => activeBeat()?.choices || [];
export const sceneActive = () => Boolean(State.Scenes.activeId);
