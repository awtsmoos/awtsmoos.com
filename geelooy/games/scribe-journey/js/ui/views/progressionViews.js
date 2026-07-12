// B"H

function screen(id) {
	return document.getElementById(id);
}

function frame(title, body, closeAction) {
	return `<div class="modal-content wide-modal"><h3>${title}</h3>${body}<button class="modal-action-button" data-action="${closeAction}">Close</button></div>`;
}

export function renderFeatures(data) {
	const body = `<div class="scroll-panel grid-cards">${data.list.map(feature => `
		<article class="grid-card ${feature.active ? 'is-active' : ''}"><strong>${feature.name}</strong><p>${feature.desc}</p></article>`).join('')}</div>`;
	screen('features-screen').innerHTML = frame('The 666 Features', body, 'close-features');
}

export function renderGates(data) {
	const body = `<div class="scroll-panel grid-cards">${data.list.map(gate => `
		<article class="grid-card ${gate.isActive ? 'is-active' : ''} ${gate.isUnlocked ? '' : 'is-dim'}">
			<strong>${gate.name}</strong><p>${gate.isUnlocked ? gate.desc : 'Locked'}</p>
			${gate.isUnlocked ? `<button class="menu-button compact-button" data-action="toggleGate" data-value="${gate.id}">${gate.isActive ? 'Disable' : 'Enable'}</button>` : ''}
		</article>`).join('')}</div>`;
	screen('gates-screen').innerHTML = frame('50 Gates of Binah', body, 'close-gates');
}

export function renderBestiary(data) {
	const entries = data.entries.map(entry => `
		<article class="grid-card bestiary-entry ${entry.seen ? '' : 'is-dim'} ${entry.caught ? 'is-gold' : ''}">
			<span class="big-entry-icon">${entry.seen ? entry.emoji : '❓'}</span><strong>${entry.seen ? entry.name : 'Unknown'}</strong>
		</article>`).join('');
	screen('bestiary-screen').innerHTML = frame('Sefer HaYetzira', `<div class="scroll-panel grid-cards">${entries}</div><p>Seen: ${data.seenCount}</p>`, 'close-bestiary');
}

export function renderMitzvahs(data) {
	const body = `<div class="scroll-panel">${data.list.map(mitzvah => `
		<article class="list-row ${mitzvah.completed ? 'is-complete' : ''}"><strong>${mitzvah.name}</strong><p>${mitzvah.desc}</p></article>`).join('')}</div>`;
	screen('mitzvah-screen').innerHTML = frame('Mitzvah Tank', body, 'close-mitzvah');
}
