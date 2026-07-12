// B"H

function renderGate(gate) {
	const locked = !gate.unlocked;
	const actionable = locked && gate.canUnlock;
	return `
		<button class="hex-gate ${gate.unlocked ? 'unlocked' : 'locked'}"
			type="button" data-action="unlockGate37" data-id="${gate.id}"
			${actionable ? '' : 'disabled'} aria-label="${gate.name}: ${gate.desc}">
			<span class="gate-icon">${gate.icon}</span>
			<strong>${gate.name}</strong>
			<small>${gate.unlocked ? 'OPEN' : `${gate.cost} WP`}</small>
			<span class="gate-tooltip">${gate.desc}</span>
		</button>`;
}

/** Renders Wisdom Gates as actual keyboard and touch accessible buttons. */
export function renderGates37(data) {
	if (!data) return '';
	return `
		<div class="modal-content wide-modal">
			<h3>The 37 Gates of Wisdom</h3>
			<p class="gold-copy">Wisdom Points: ${data.points}</p>
			<div class="gates-hex-grid">${data.gates.map(renderGate).join('')}</div>
			<button class="modal-action-button" data-action="close-gates37">Close</button>
		</div>`;
}
