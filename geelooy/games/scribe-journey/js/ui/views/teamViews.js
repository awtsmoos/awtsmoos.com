// B"H

function screen(id) {
	return document.getElementById(id);
}

export function renderShem(data) {
	const cards = data.team.map(member => `
		<article class="team-card"><span class="big-entry-icon">${member.emoji}</span><div><strong>${member.name}</strong><small>Lv ${member.level}</small></div></article>`).join('');
	screen('shem-screen').innerHTML = `<div class="modal-content"><h3>Your Shem</h3><div class="team-grid">${cards}</div><button class="modal-action-button" data-action="close-shem">Close</button></div>`;
}

export function renderCrafting(data) {
	const recipes = data.recipes.map(recipe => `
		<article class="list-row"><div><strong>${recipe.name}</strong><p>${recipe.description}</p><small>${recipe.ingredients.map(item => `${item.name} ${item.has}/${item.needed}`).join(' · ')}</small></div><button class="menu-button compact-button" data-action="craftAction" data-recipe-id="${recipe.id}" ${recipe.canCraft ? '' : 'disabled'}>Craft</button></article>`).join('');
	screen('crafting-screen').innerHTML = `<div class="modal-content wide-modal"><h3>Tikkun Kelim</h3><div class="scroll-panel">${recipes}</div><button class="modal-action-button" data-action="close-crafting">Close</button></div>`;
}

export function renderOtzar(data) {
	const row = (member, index, from, label) => `<article class="list-row"><span>${member.emoji} ${member.name} · Lv ${member.level}</span><button class="menu-button compact-button" data-action="swapOtzar" data-from="${from}" data-index="${index}">${label}</button></article>`;
	const team = data.team.map((member, index) => row(member, index, 'team', 'Deposit')).join('');
	const storage = data.storage.map((member, index) => row(member, index, 'storage', 'Withdraw')).join('') || '<p class="empty-state">Empty</p>';
	screen('otzar-screen').innerHTML = `<div class="modal-content wide-modal"><h3>Otzar HaNefashot</h3><div class="two-column-panel"><section><h4>Current Shem</h4>${team}</section><section><h4>Storage</h4>${storage}</section></div><button class="modal-action-button" data-action="close-otzar">Close</button></div>`;
}
