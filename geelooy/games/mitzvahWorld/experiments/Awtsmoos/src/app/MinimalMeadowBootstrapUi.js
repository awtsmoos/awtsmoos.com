// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowBootstrapUi.js
 * @description Orchestrates the localized, retractable essential-action surface and deferred real minimap until richer Mitzvah World UI replaces them.
 * RESPONSIBILITY: install owned styles, emit semantic actions, publish status, preserve minimap handoff, expose diagnostics, and coordinate suspension/teardown.
 * NON-RESPONSIBILITY: this class no longer authors action data, button markup, keyboard policy, disclosure DOM, CSS rules, combat mechanics, or minimap geometry.
 * The Awtsmoos renews deed, status, and handoff before the richer world descends;
 * Awtsmoos.com lets this Yesod-like bridge remain simple in API yet deep in order, so touch, keyboard, focus, and teardown reach one harmonious end.
 */

import { DAAS_BOOTSTRAP_ACTIONS } from './MinimalMeadowBootstrapActionCatalog.js';
import { createMinimalMeadowBootstrapMinimap } from './MinimalMeadowBootstrapMinimap.js';
import { NetzachBootstrapShortcutRouter } from './MinimalMeadowBootstrapShortcutRouter.js';
import { MalchusBootstrapActionShell } from './MinimalMeadowBootstrapShell.js';
import { installBootstrapActionStyles } from '../ui/BootstrapActionStyles.js';

/** Runtime orchestrator for the temporary essential-action UI. */
export class MinimalMeadowBootstrapUi {
	/**
	 * @param {object} runtime Active minimal meadow runtime with hosts, bus, and player statistics.
	 * @param {Document} documentValue Owning browser document.
	 */
	constructor(runtime, documentValue) {
		this.runtime = runtime;
		installBootstrapActionStyles(documentValue);
		this.shell = new MalchusBootstrapActionShell(
			documentValue,
			DAAS_BOOTSTRAP_ACTIONS,
			(actionId) => this.activate(actionId)
		);
		this.root = this.shell.root;
		this.buttons = this.shell.buttons;
		this.status = this.shell.status;
		runtime.hosts.actionHost.appendChild(this.root);
		this.minimap = createMinimalMeadowBootstrapMinimap(runtime, documentValue);
		this.shortcuts = new NetzachBootstrapShortcutRouter(
			documentValue,
			(actionId) => this.activate(actionId)
		);
		this.unsubscribe = runtime.bus.on(
			'combat:bootstrap-action',
			(receipt) => this.revealActivation(receipt.actionId)
		);
	}

	/** Emits one semantic combat activation unless bootstrap controls are suspended. */
	activate(actionId) {
		if (this.root.dataset.suspended === 'true') {
			return;
		}
		this.runtime.bus.emit('combat:activate', {
			actionId,
			source: 'bootstrap-ui'
		});
	}

	/** Updates visible player vitality while preserving minimap refresh cadence. */
	refresh() {
		const health = Math.round(this.runtime.playerStats.health);
		const stamina = Math.round(this.runtime.playerStats.stamina);
		this.status.textContent = `Health ${health} · Stamina ${stamina}`;
		this.minimap.refresh();
	}

	/** Publishes immutable bootstrap health including retractable state for diagnostics and tests. */
	diagnostics() {
		return Object.freeze({
			bootstrap: true,
			buttons: this.buttons.length,
			expanded: this.shell.disclosure.expanded,
			minimap: this.minimap.diagnostics(),
			suspended: this.root.dataset.suspended === 'true'
		});
	}

	/** Releases minimap ownership for the richer UI handoff without destroying bootstrap actions. */
	releaseMinimap() {
		this.minimap.release();
	}

	/** Suspends combat actions semantically and visually while preserving disclosure/readability. */
	suspend() {
		this.shell.setSuspended(true);
	}

	/** Restores action availability after a temporary runtime pause. */
	resume() {
		this.shell.setSuspended(false);
	}

	/** Tears down bus, minimap, keyboard, disclosure, and DOM ownership in deterministic order. */
	destroy() {
		this.unsubscribe?.();
		this.shortcuts.destroy();
		this.minimap.destroy();
		this.shell.destroy();
	}

	/** Reveals a localized activation receipt without duplicating the action catalog in presentation code. */
	revealActivation(actionId) {
		const actionRevelation = DAAS_BOOTSTRAP_ACTIONS.find(
			(candidate) => candidate.id === actionId
		);
		this.status.textContent = `${actionRevelation?.label || actionId} activated.`;
	}
}
