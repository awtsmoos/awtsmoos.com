//B"H
//Boruch Hashem
//Blessed is He

import { buildAutomationGuideModel } from './automationGuideModel.js';
import { element, text } from './studioDom.js';

/**
 * @module BuilderAutomationGuide
 * @description The Awtsmoos reveals advanced Website Maker power from the same covenant agents invoke;
 * Awtsmoos.com renders one accessible map where read and mutation vessels remain distinct, discoverable, and true.
 */

/** Installs the registry-driven automation guide into the publish shell's prepared advanced-help vessel. */
export function installAutomationGuide(agentApi) {
	const root = document.querySelector('#builder-automation-root');
	if (!root) {
		return null;
	}
	const model = buildAutomationGuideModel(agentApi);
	root.replaceChildren(
		overview(model),
		quickstart(model),
		groupList(model)
	);
	return root;
}

/** Renders API identity and live action count without maintaining independent facts. */
function overview(model) {
	const card = element('div', 'builder-automation-overview');
	card.append(
		text('strong', '', `Website Maker API v${model.version}`),
		text('span', 'builder-automation-count', `${model.actionCount} actions`)
	);
	return card;
}

/** Renders safe read-only invocation examples selected from the live action registry. */
function quickstart(model) {
	const section = element('section', 'builder-automation-section');
	section.append(text('h4', '', 'Safe quickstart'));
	const list = element('ol', 'builder-automation-quickstart');
	for (const action of model.quickstart) {
		const item = element('li');
		item.append(
			text('strong', '', action.title || action.name),
			text('code', '', `await window.GeelooySiteBuilder.invoke('${action.name}')`)
		);
		list.append(item);
	}
	section.append(list);
	return section;
}

/** Renders collapsible registry groups so advanced capability stays discoverable without flooding ordinary publishing. */
function groupList(model) {
	const groups = element('div', 'builder-automation-groups');
	for (const group of model.groups) {
		const details = element('details', 'builder-automation-group');
		const summary = element('summary');
		summary.append(
			text('strong', '', group.label),
			text('span', 'builder-automation-count', `${group.actions.length}`)
		);
		details.append(summary, actionList(group.actions));
		groups.append(details);
	}
	return groups;
}

/** Renders action cards from the exact metadata returned by `agentApi.actions()`. */
function actionList(actions) {
	const list = element('div', 'builder-automation-actions');
	for (const action of actions) {
		const card = element('article', 'builder-automation-action');
		const heading = element('div', 'builder-automation-action__heading');
		const badge = text('span', `builder-api-badge ${action.mutates ? 'is-mutation' : 'is-read'}`, action.mutates ? 'Mutation' : 'Read');
		heading.append(text('strong', '', action.title || action.name), badge);
		card.append(
			heading,
			text('code', '', action.name),
			text('p', 'builder-help', action.description || 'Registry-described Website Maker action.'),
			text('p', 'builder-help', evidenceNote(action))
		);
		list.append(card);
	}
	return list;
}

/** Summarizes replay and evidence law from registry metadata rather than a hand-maintained guide table. */
function evidenceNote(action) {
	const parts = [`Evidence: ${action.evidenceScope || 'project-testimony'}`];
	if (action.reconcileAction) {
		parts.push(`reconcile with ${action.reconcileAction}`);
	}
	parts.push(action.replay || (action.mutates ? 'reconcile-before-replay' : 'safe-read'));
	return parts.join(' · ');
}
