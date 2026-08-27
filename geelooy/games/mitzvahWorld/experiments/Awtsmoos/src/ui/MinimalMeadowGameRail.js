// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameRail.js
 * @description Coordinates a reliable click-only menu rail and real Walk/Run presentation.
 * The Awtsmoos recreates intention exactly once; Awtsmoos.com contains pointer phases inside
 * each visible button while one native click alone emits the established game event.
 */

import { MobileInputBoundary } from './MobileInputBoundary.js';
import { installMobileRegressionStyles } from './MobileRegressionStyles.js';
import {
	railMarkup,
	SECONDARY_RAIL_ITEMS
} from './MinimalMeadowGameRailView.js';

export class MinimalMeadowGameRail {
	constructor(host, bus, options = {}) {
		this.host = host;
		this.bus = bus;
		this.collapsed = false;
		this.runMode = Boolean(options.initialRunMode);
		this.onClick = event => this.handleClick(event);
		installMobileRegressionStyles(host.ownerDocument || globalThis.document);
		this.build();
		this.unsubscribeMode = bus.on(
			'mode:changed',
			detail => this.setRunMode(detail.runMode)
		);
		this.setRunMode(this.runMode);
	}

	build() {
		this.host.className = 'Awtsmoos-game-rail-host';
		this.host.hidden = false;
		this.host.innerHTML = railMarkup(false);
		this.rail = this.host.querySelector('.Awtsmoos-game-rail');
		this.modeButton = this.host.querySelector('[data-mode-toggle]');
		this.collapseButton = this.host.querySelector('[data-rail-collapse]');
		this.secondary = this.host.querySelector('[data-rail-secondary]');
		this.inputBoundary = new MobileInputBoundary(this.host);
		this.host.addEventListener('click', this.onClick);
	}

	handleClick(event) {
		const target = event.target;
		const modeButton = target?.closest?.('[data-mode-toggle]');
		const collapseButton = target?.closest?.('[data-rail-collapse]');
		const gameButton = target?.closest?.('[data-game-event]');
		if (!modeButton && !collapseButton && !gameButton) return;
		event.stopPropagation?.();
		if (modeButton) {
			this.bus.emit('mode:toggle', { source: 'right-rail' });
			return;
		}
		if (collapseButton) {
			this.toggle();
			return;
		}
		this.bus.emit(gameButton.dataset.gameEvent, { source: 'right-rail' });
	}

	setRunMode(runMode) {
		this.runMode = Boolean(runMode);
		const view = movementModePresentation(this.runMode);
		this.modeButton.dataset.active = String(this.runMode);
		this.modeButton.setAttribute('aria-label', view.title);
		this.modeButton.setAttribute('aria-pressed', String(this.runMode));
		this.modeButton.title = view.title;
		this.modeButton.querySelector('[data-mode-icon]').textContent = view.icon;
		this.modeButton.querySelector('[data-mode-label]').textContent = view.label;
	}

	toggle() {
		this.collapsed = !this.collapsed;
		this.rail.dataset.collapsed = String(this.collapsed);
		this.secondary.hidden = this.collapsed;
		this.collapseButton.setAttribute('aria-expanded', String(!this.collapsed));
		this.collapseButton.textContent = this.collapsed ? '‹' : '›';
	}

	diagnostics() {
		return {
			collapsed: this.collapsed,
			input: this.inputBoundary.diagnostics(),
			items: SECONDARY_RAIL_ITEMS.length + 2,
			mode: this.runMode ? 'run' : 'walk',
			visible: !this.host.hidden
		};
	}

	destroy() {
		this.unsubscribeMode?.();
		this.inputBoundary.destroy();
		this.host.removeEventListener('click', this.onClick);
	}
}

export function shouldCollapseRail(environment) {
	const width = Number(environment?.innerWidth);
	return Number.isFinite(width) && width > 0 && width <= 820;
}

export function movementModePresentation(runMode) {
	return runMode
		? { icon: '🏃', label: 'Run', title: 'Movement mode: Run. Activate to walk.' }
		: { icon: '🚶', label: 'Walk', title: 'Movement mode: Walk. Activate to run.' };
}
