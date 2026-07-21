// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityTooltip.js
 * @description Accessible, local, transition-only detail for an action-bar ability.
 */

import { torahAbilityPresentation } from './TorahAbilityPresentation.js';

export class TorahAbilityTooltip {
	constructor(host) {
		this.element = document.createElement('aside');
		this.element.className = 'Mitzvah-ability-tooltip';
		this.element.id = 'Mitzvah-ability-tooltip';
		this.element.setAttribute('aria-hidden', 'true');
		this.element.setAttribute('role', 'tooltip');
		this.element.hidden = true;
		host.appendChild(this.element);
	}

	show(definition, readiness, anchor) {
		if (!definition || !anchor) return this.hide();
		const presentation = torahAbilityPresentation(definition.id);
		this.element.replaceChildren(
			row('Mitzvah-tooltip-heading', `${presentation.glyph} ${definition.title}`),
			row('Mitzvah-tooltip-school', definition.school),
			row('Mitzvah-tooltip-description', definition.description),
			stats(definition),
			row(
				readiness?.ok ? 'Mitzvah-tooltip-ready' : 'Mitzvah-tooltip-unavailable',
				readinessLabel(readiness)
			)
		);
		const bounds = anchor.getBoundingClientRect();
		this.element.style.setProperty('--tooltip-x', `${bounds.left + bounds.width / 2}px`);
		this.element.style.setProperty('--tooltip-y', `${Math.max(8, bounds.top - 12)}px`);
		this.element.hidden = false;
		this.element.setAttribute('aria-hidden', 'false');
	}

	hide() {
		this.element.hidden = true;
		this.element.setAttribute('aria-hidden', 'true');
	}

	destroy() {
		this.element.remove();
	}
}

function stats(definition) {
	const element = document.createElement('dl');
	element.className = 'Mitzvah-tooltip-stats';
	const values = [
		['Focus', definition.resourceCost],
		['Range', definition.range ? `${definition.range}m` : 'Self'],
		['Cast', castLabel(definition)],
		['Cooldown', `${(definition.cooldownMilliseconds / 1000).toFixed(1)}s`]
	];
	for (const [label, value] of values) {
		element.append(row('Mitzvah-tooltip-term', label, 'dt'));
		element.append(row('Mitzvah-tooltip-value', value, 'dd'));
	}
	return element;
}

function castLabel(definition) {
	if (definition.castType === 'channel') return `${definition.channelMilliseconds / 1000}s channel`;
	if (!definition.castMilliseconds) return definition.castType;
	return `${definition.castMilliseconds / 1000}s ${definition.castType}`;
}

function readinessLabel(readiness) {
	if (!readiness) return '';
	if (readiness.ok) return 'Ready';
	return String(readiness.reason || 'Unavailable').replaceAll('-', ' ');
}

function row(className, text, tagName = 'p') {
	const element = document.createElement(tagName);
	element.className = className;
	element.textContent = text;
	return element;
}
