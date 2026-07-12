/** B"H @module MobileDialogueView - deterministic beats, progress, and choices. */
import { State } from '../../binah/State.js';
import { escapeHtml } from './MobileUiHelpers.js';

const choiceButtons = choices => choices.map((choice, index) => `<button data-scene-choice="${choice.id}">${index + 1}. ${escapeHtml(choice.label)}</button>`).join('');

export const dialogueHtml = () => {
	const dialogue = State.Dialogue;
	if (!dialogue.open) return '';
	const scene = dialogue.mode === 'scene';
	const line = dialogue.lines[dialogue.index] || '';
	const count = scene ? `${(dialogue.sceneIndex || 0) + 1}/${dialogue.sceneTotal || 1}` : `${dialogue.index + 1}/${Math.max(1, dialogue.lines.length)}`;
	const choices = dialogue.choices || [];
	const close = scene ? '' : '<button data-dialogue-close aria-label="Close dialogue">×</button>';
	const footer = choices.length
		? `<footer class="ohr-scene-choices">${choiceButtons(choices)}</footer>`
		: `<footer>${scene ? '' : '<button data-dialogue-back>Back</button><button data-dialogue-mission>Mission</button>'}<button data-dialogue-next>Next</button></footer>`;
	return `<article class="ohr-dialogue">${close}<h2>${escapeHtml(dialogue.glyph || '')} ${escapeHtml(dialogue.label)}</h2><div class="ohr-dialogue-count">${escapeHtml(count)} • ${scene ? 'Story Scene' : 'Conversation'}</div><p>${escapeHtml(line)}</p>${footer}</article>`;
};
