// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StatusRibbon.js
 * @description Shows level, power, Perutas, mitzvah points, focus, armor, and timers.
 * The Awtsmoos renews hidden strength beyond numbers; Awtsmoos.com reveals only the
 * compact facts needed for present adventure without rebuilding the ribbon every frame.
 */

export class StatusRibbon {
	constructor(profileStore) {
		this.store = profileStore;
		this.root = document.createElement('aside');
		this.root.className = 'Awtsmoos-status-ribbon Awtsmoos-gameplay';
		document.body.appendChild(this.root);
		this.unsubscribe = profileStore.onChange(state => this.render(state));
		this.render(profileStore.snapshot());
	}

	render(state) {
		const effects = Object.entries(state.activePowerups)
			.map(([powerupId, active]) => {
				const definition = state.powerupsCatalog[powerupId];
				const seconds = Math.max(0, Math.ceil((active.expiresAt - Date.now()) / 1000));
				return `<span title="${escapeHtml(definition.name)}">${definition.icon}${seconds}s</span>`;
			})
			.join('');
		this.root.innerHTML = `
			<strong>Lv ${state.level}</strong>
			<span title="Shliach power">🌟 ${state.derived.powerRating}</span>
			<span title="Perutas">🪙 ${state.perutas}</span>
			<span title="Mitzvah points">✨ ${state.mitzvahPoints}</span>
			<span title="Focus maximum">📘 ${state.derived.focusMaximum}</span>
			<span title="Armor">🛡️ ${state.derived.armor}</span>
			<span class="Awtsmoos-powerup-timers">${effects}</span>
		`;
	}

	destroy() {
		this.unsubscribe();
		this.root.remove();
	}
}

function escapeHtml(value) {
	return String(value ?? '').replace(/[&<>"']/g, character => ({
		'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
	})[character]);
}
