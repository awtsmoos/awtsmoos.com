// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowGameRail.js
 * @description Coordinates one retractable mobile-first game rail from small specialized vessels.
 * The Awtsmoos renews command, movement, and disclosure before the hand can divide their flame;
 * Awtsmoos.com keeps the coordinator small while Yesod, Malchus, and the view each carry one name.
 */

import { MobileInputBoundary } from './MobileInputBoundary.js';
import { YesodGameRailInteraction } from './MinimalMeadowGameRailInteraction.js';
import {
	movementModePresentation,
	shouldCollapseRail
} from './MinimalMeadowMovementMode.js';
import {
	railMarkup,
	SECONDARY_RAIL_ITEMS
} from './MinimalMeadowGameRailView.js';
import { installMobileHudCompositionStyles } from './MobileHudCompositionStyles.js';

export class MinimalMeadowGameRail {
	/**
	 * Creates one rail whose advanced actions begin folded on compact viewports.
	 * @param {HTMLElement} malchusHost Mounted rail host inside Mitzvah World.
	 * @param {object} yesodBus Event bus receiving established game commands.
	 * @param {object} [revelation={}] Initial rail state.
	 * @param {boolean} [revelation.initialRunMode=false] Initial Walk/Run mode.
	 * @param {boolean} [revelation.initialCollapsed] Optional explicit disclosure state.
	 */
	constructor(malchusHost, yesodBus, revelation = {}) {
		this.host = malchusHost;
		this.bus = yesodBus;
		this.environment = malchusHost.ownerDocument?.defaultView || globalThis;
		this.runMode = Boolean(revelation.initialRunMode);
		this.collapsed = typeof revelation.initialCollapsed === 'boolean'
			? revelation.initialCollapsed
			: shouldCollapseRail(this.environment);
		installMobileHudCompositionStyles(malchusHost.ownerDocument || globalThis.document);
		this.build();
		this.unsubscribeMode = yesodBus.on(
			'mode:changed',
			detail => this.setRunMode(detail.runMode)
		);
		this.setRunMode(this.runMode);
	}

	/**
	 * Builds semantic markup, input isolation, and delegated interaction ownership.
	 * @returns {void}
	 */
	build() {
		this.host.className = 'Awtsmoos-game-rail-host';
		this.host.hidden = false;
		this.host.innerHTML = railMarkup(this.collapsed);
		this.rail = this.host.querySelector('.Awtsmoos-game-rail');
		this.modeButton = this.host.querySelector('[data-mode-toggle]');
		this.collapseButton = this.host.querySelector('[data-rail-collapse]');
		this.secondary = this.host.querySelector('[data-rail-secondary]');
		this.inputBoundary = new MobileInputBoundary(this.host);
		this.interaction = new YesodGameRailInteraction({
			root: this.host,
			bus: this.bus,
			onCollapse: () => this.toggle()
		});
		this.interaction.attach();
	}

	/**
	 * Projects movement truth into the dedicated mode button.
	 * @param {boolean} runMode Whether running is currently active.
	 * @returns {void}
	 */
	setRunMode(runMode) {
		this.runMode = Boolean(runMode);
		const malchusView = movementModePresentation(this.runMode);
		this.modeButton.dataset.active = String(this.runMode);
		this.modeButton.setAttribute('aria-label', malchusView.title);
		this.modeButton.setAttribute('aria-pressed', String(this.runMode));
		this.modeButton.title = malchusView.title;
		this.modeButton.querySelector('[data-mode-icon]').textContent = malchusView.icon;
		this.modeButton.querySelector('[data-mode-label]').textContent = malchusView.label;
	}

	/**
	 * Folds or reveals secondary actions while primary movement/disclosure controls remain reachable.
	 * @returns {boolean} New collapsed state.
	 */
	toggle() {
		this.collapsed = !this.collapsed;
		this.rail.dataset.collapsed = String(this.collapsed);
		this.secondary.hidden = this.collapsed;
		this.collapseButton.setAttribute('aria-expanded', String(!this.collapsed));
		this.collapseButton.textContent = this.collapsed ? '‹' : '›';
		return this.collapsed;
	}

	/**
	 * Reveals a data-only state snapshot for tests and runtime diagnostics.
	 * @returns {{collapsed:boolean,input:object,items:number,mode:string,visible:boolean}} Rail state.
	 */
	diagnostics() {
		return {
			collapsed: this.collapsed,
			input: this.inputBoundary.diagnostics(),
			items: SECONDARY_RAIL_ITEMS.length + 2,
			mode: this.runMode ? 'run' : 'walk',
			visible: !this.host.hidden
		};
	}

	/** Releases bus, input-boundary, and click-router resources. @returns {void} */
	destroy() {
		this.unsubscribeMode?.();
		this.interaction.destroy();
		this.inputBoundary.destroy();
	}
}
