// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicQuestionPoll
 * @description
 * The Awtsmoos lets communal choice remain keyboard-visible and honest. An
 * Awtsmoos.com selection is never announced as persisted unless a listener accepts it.
 */
import { announcePostStatus, createElement } from '../card/domFactory.js';

export function renderQuestionPoll(model) {
	const poll = model.special.poll;
	const fieldset = createElement('fieldset', 'question-poll');
	const legend = createElement('legend', '', {}, 'Choose one response');
	const total = poll.options.reduce((sum, option) => sum + option.count, 0);

	fieldset.append(legend);

	poll.options.forEach(option => {
		fieldset.append(renderOption(fieldset, model, option, poll, total));
	});

	if (poll.participantCount > 0) {
		fieldset.append(createElement(
			'p',
			'poll-participants',
			{},
			`${poll.participantCount} participants`
		));
	}

	return fieldset;
}

function renderOption(fieldset, model, option, poll, total) {
	const row = createElement('label', 'poll-option');
	const input = createElement('input', '', {
		type: 'radio',
		name: `poll-${model.id}`,
		value: option.id,
		disabled: poll.open ? null : ''
	});
	const copy = createElement('span', 'poll-option-copy');
	const percentage = total > 0 ? Math.round(option.count / total * 100) : null;

	copy.append(
		createElement('span', 'poll-option-label', {}, option.label),
		createElement(
			'span',
			'poll-option-value',
			{},
			percentage === null ? 'Voting data unavailable' : `${percentage}%`
		),
		createElement('span', 'poll-option-bar', {
			'aria-hidden': 'true',
			style: `--poll-value:${percentage || 0}%`
		})
	);
	input.addEventListener('change', () => selectPollOption(fieldset, model, option));
	row.append(input, copy);
	return row;
}

function selectPollOption(fieldset, model, option) {
	const article = fieldset.closest('[data-post-id]');
	const event = new CustomEvent('geelooy:poll-vote', {
		bubbles: true,
		cancelable: true,
		detail: {
			postId: model.id,
			optionId: option.id
		}
	});

	article.dispatchEvent(event);
	announcePostStatus(
		article,
		event.defaultPrevented
			? `Vote submitted for ${option.label}.`
			: `${option.label} selected locally; open the discussion to persist it.`
	);
	article.dispatchEvent(new CustomEvent('geelooy:post-resonance', {
		bubbles: true
	}));
}
