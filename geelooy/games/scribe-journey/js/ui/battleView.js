// B"H

function setText(id, value) {
	const element = document.getElementById(id);
	if (element) element.textContent = value ?? '';
}

function setBar(id, percentage) {
	const element = document.getElementById(id);
	if (element) element.style.setProperty('--bar-value', `${Math.max(0, Math.min(100, percentage || 0))}%`);
}

export function updateBattleView(state) {
	if (!state?.player || !state?.opponent) return;
	setText('player-name', state.player.name);
	setText('player-level', `Lv ${state.player.level}`);
	setText('player-emoji', state.player.emoji);
	setBar('player-hp-bar', state.player.hpPercent);
	setBar('player-kavanah-bar', state.player.kavanahPercent);
	setText('opponent-name', state.opponent.name);
	setText('opponent-level', `Lv ${state.opponent.level}`);
	setText('opponent-emoji', state.opponent.emoji);
	setBar('opponent-hp-bar', state.opponent.hpPercent);

	const log = document.getElementById('battle-log');
	const menu = document.getElementById('battle-menu-container');
	const indicator = document.getElementById('battle-log-continue-indicator');
	const showingLog = Boolean(state.log);
	log?.classList.toggle('is-visible', showingLog);
	menu?.classList.toggle('is-visible', !showingLog && Boolean(state.menu));
	indicator?.classList.toggle('is-visible', Boolean(state.awaitingConfirm));
	if (log && showingLog) log.innerHTML = state.log;
	if (menu && state.menu) {
		menu.innerHTML = state.menu.buttons.map(button => `
			<button class="battle-button ${button.className || ''}" data-action="${button.action}" data-value="${button.value || ''}" ${button.disabled ? 'disabled' : ''}>
				${button.text}
			</button>`).join('');
	}
}
