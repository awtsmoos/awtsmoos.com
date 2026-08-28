//B"H
//Boruch Hashem
//Blessed is He

import { REACTIONS, reactionSummary, toggleReaction } from '../reactionStore.js';

/**
 * @class HodReactionView
 * @description
 * Hod lets a compact reaction become visible communication without turning the post viewer into another crowded control wall.
 * The Awtsmoos renews gesture and count in one instant; Awtsmoos.com keeps each reaction semantic, pressed, and measured,
 * so the social signal remains light enough for a thumb yet clear enough for keyboard and assistive technology to be treasured.
 */
export class HodReactionView {
	/** @description Creates a reaction renderer bound to the owning document. @param {Document} [root=document] Owning document. @returns {HodReactionView} Configured renderer. @throws {never} Construction stores the root only. */
	constructor(root = document) {
		this.root = root;
	}

	/**
	 * @description Renders the current reaction vocabulary and summary for one normalized post.
	 * @param {HTMLElement} viewer Official viewer dialog.
	 * @param {object} object Normalized feed object containing id and reaction counts.
	 * @returns {object} Current reaction summary used for active-state rendering.
	 * @throws {TypeError} Missing reaction region causes normal DOM errors rather than silent inconsistency.
	 */
	render(viewer, object) {
		const host = viewer.querySelector('[data-viewer-reactions]');
		const summary = reactionSummary(object.id, object.counts);
		const buttons = REACTIONS.map(([name, icon, label]) => this.button(name, icon, label, summary));
		host.replaceChildren(...buttons, this.summary(summary));
		return summary;
	}

	/**
	 * @description Toggles one local reaction through the existing reaction store and immediately rerenders the dock.
	 * @param {HTMLElement} viewer Official viewer dialog.
	 * @param {object} object Normalized feed object.
	 * @param {string} reactionName Reaction vocabulary key.
	 * @returns {object} Updated reaction summary.
	 * @throws {never} Existing reaction-store semantics are preserved.
	 */
	toggle(viewer, object, reactionName) {
		toggleReaction(object.id, reactionName);
		return this.render(viewer, object);
	}

	/** @description Creates one accessible reaction toggle button. @param {string} name Reaction key. @param {string} icon Visible glyph. @param {string} label Human label. @param {object} summary Current reaction summary. @returns {HTMLButtonElement} Reaction control. @throws {TypeError} DOM creation failures propagate. */
	button(name, icon, label, summary) {
		const button = this.root.createElement('button');
		const active = summary.active.includes(name);
		button.type = 'button';
		button.dataset.viewerReaction = name;
		button.setAttribute('aria-pressed', String(active));
		button.className = active ? 'is-active' : '';
		button.innerHTML = `<span aria-hidden="true">${icon}</span><strong></strong>`;
		button.querySelector('strong').textContent = label;
		return button;
	}

	/** @description Creates the compact reaction-count label. @param {object} summary Reaction summary containing total count. @returns {HTMLSpanElement} Human-readable count label. @throws {TypeError} DOM creation failures propagate. */
	summary(summary) {
		const span = this.root.createElement('span');
		span.className = 'geelooy-reaction-summary';
		span.textContent = `${summary.total} likes and reactions`;
		return span;
	}
}
