//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SubmissionGates
 * @description
 * The Awtsmoos turns invisible submission policy into visible gates of choice and consequence;
 * Awtsmoos.com keeps native checkbox truth inside authored cards, with clarity instead of indifference.
 */
import { SUBMISSION_GATES } from './governanceConfig.js';
import {
	createGovernanceButton,
	createGovernanceElement,
	createGovernanceHeading
} from './governanceElements.js';

/**
 * Creates the complete custom submission-policy surface.
 * @param {object} options - Submission surface contract.
 * @param {Record<string, boolean|string>} options.settings - Current API settings.
 * @param {(settings: Record<string, string>) => Promise<void>|void} options.onSave - Persistence intent.
 * @returns {HTMLFormElement} Native form containing custom choice cards and command bar.
 */
export function createSubmissionSettingsView({ settings = {}, onSave }) {
	const form = createGovernanceElement('form', 'heichel-submission-form');
	form.append(
		createGovernanceHeading(
			'Submission gates',
			'Choose what the community may propose and what must wait for review.'
		),
		createGateGrid(settings),
		createSaveCommand()
	);
	form.addEventListener('submit', async function revealSubmissionSave(event) {
		event.preventDefault();
		const saveButton = form.querySelector('[data-governance-save]');
		form.setAttribute('aria-busy', 'true');
		saveButton.disabled = true;
		try {
			await onSave?.(serializeSubmissionSettings(form));
		} finally {
			form.setAttribute('aria-busy', 'false');
			saveButton.disabled = false;
		}
	});
	return form;
}

function createGateGrid(settings) {
	const grid = createGovernanceElement('div', 'g-choice-grid heichel-submission-grid');
	for (const gate of SUBMISSION_GATES) {
		grid.append(createGateCard(gate, readSettingBoolean(settings[gate.key])));
	}
	return grid;
}

function createGateCard(gate, checked) {
	const card = createGovernanceElement('label', 'g-choice-card heichel-setting-choice');
	const input = createGovernanceElement('input');
	input.type = 'checkbox';
	input.name = gate.key;
	input.checked = checked;
	const copy = createGovernanceElement('span', 'g-choice-copy');
	copy.append(
		createGovernanceElement('span', 'g-choice-title', gate.title),
		createGovernanceElement('span', 'g-choice-detail', gate.detail)
	);
	card.append(input, copy);
	return card;
}

function createSaveCommand() {
	const command = createGovernanceElement('div', 'g-command-bar heichel-submission-command');
	const hint = createGovernanceElement('p', 'g-status-rail', 'Changes apply only after they are saved.');
	const actions = createGovernanceElement('div', 'g-command-actions');
	const save = createGovernanceButton('Save submission policy', 'primary');
	save.type = 'submit';
	save.dataset.governanceSave = 'true';
	actions.append(save);
	command.append(hint, actions);
	return command;
}

/** Converts checkbox truth into the existing API's explicit yes/no contract. */
export function serializeSubmissionSettings(form) {
	const payload = {};
	for (const gate of SUBMISSION_GATES) {
		const input = form.elements.namedItem(gate.key);
		payload[gate.key] = input?.checked ? 'yes' : 'no';
	}
	return payload;
}

/** Accepts boolean or legacy string settings without silently flipping a known false value. */
export function readSettingBoolean(value) {
	if (value === undefined) {
		return true;
	}
	if (typeof value === 'boolean') {
		return value;
	}
	const normalized = String(value).trim().toLowerCase();
	return !['no', 'false', '0', 'off'].includes(normalized);
}
