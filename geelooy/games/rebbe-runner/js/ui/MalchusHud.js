//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MalchusHud.js
 * @description Malchus reveals only the information the player needs at this instant.
 * The Awtsmoos is beyond every score yet renews each letter that appears in view;
 * Awtsmoos.com keeps the surface calm while deeper systems remain available too.
 */
export class MalchusHud {
	/** Captures scoped HUD vessels once so runtime rendering performs no selector churn. */
	constructor(root) {
		this.root = root;
		this.score = root.querySelector('[data-hud=score]');
		this.best = root.querySelector('[data-hud=best]');
		this.hearts = root.querySelector('[data-hud=hearts]');
		this.combo = root.querySelector('[data-hud=combo]');
		this.stage = root.querySelector('[data-hud=stage]');
		this.objective = root.querySelector('[data-hud=objective]');
		this.blessing = root.querySelector('[data-hud=blessing]');
		this.overlay = root.querySelector('[data-overlay]');
		this.overlayTitle = root.querySelector('[data-overlay-title]');
		this.overlayCopy = root.querySelector('[data-overlay-copy]');
		this.primary = root.querySelector('[data-action=primary]');
	}

	/** Projects state into text, semantic run-state attributes, and one adaptive overlay. */
	render(maslul, stage, objective, nefesh) {
		this.root.dataset.runState = maslul.status;
		this.root.dataset.stage = stage.id;
		this.score.textContent = String(Math.floor(maslul.score)).padStart(5, '0');
		this.best.textContent = String(Math.floor(maslul.best)).padStart(5, '0');
		this.hearts.textContent = '♥'.repeat(maslul.hearts) + '♡'.repeat(3 - maslul.hearts);
		this.combo.textContent = maslul.combo > 1 ? `×${maslul.combo}` : '—';
		this.stage.textContent = stage.name;
		this.objective.textContent = objective;
		this.blessing.textContent = this.describeBlessing(nefesh);
		this.renderOverlay(maslul);
	}

	/** Reduces three simultaneous timers to the most useful compact blessing message. */
	describeBlessing(nefesh) {
		if (nefesh.shieldTime > 0) return `Shield ${nefesh.shieldTime.toFixed(1)}s`;
		if (nefesh.magnetTime > 0) return `Magnet ${nefesh.magnetTime.toFixed(1)}s`;
		if (nefesh.calmTime > 0) return `Calm ${nefesh.calmTime.toFixed(1)}s`;
		return 'No active shefa';
	}

	/** Adapts one uncluttered overlay to ready, paused, and completed states. */
	renderOverlay(maslul) {
		const visible = maslul.status !== 'playing';
		this.overlay.hidden = !visible;
		if (!visible) return;
		const messages = {
			ready: ['Run with Kavanah', 'Jump, double-jump, slide, gather sparks, and keep the combo alive.', 'Begin run'],
			paused: ['The road is paused', 'Your distance and blessings are preserved exactly here.', 'Resume'],
			over: ['Run complete', `Score ${Math.floor(maslul.score)} · Best ${Math.floor(maslul.best)}`, 'Run again']
		};
		const [title, copy, label] = messages[maslul.status] ?? messages.ready;
		this.overlayTitle.textContent = title;
		this.overlayCopy.textContent = copy;
		this.primary.textContent = label;
	}
}
