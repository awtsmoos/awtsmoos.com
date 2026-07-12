// B"H

function screen(id) {
	return document.getElementById(id);
}

export function renderDreidel(data) {
	const result = data.lastResult;
	screen('dreidel-screen').innerHTML = `<div class="modal-content narrow-modal"><h3>High Stakes Dreidel</h3><div class="big-symbol">${result?.letter || '🥯'}</div><p>${result?.outcome || 'Spin to play.'}</p><div class="balance-row"><span>Pot ${data.pot}p</span><span>Pockets ${data.playerMoney}p</span></div><div class="button-row"><button class="menu-button" data-action="spinDreidel" data-value="10">Bet 10</button><button class="menu-button" data-action="spinDreidel" data-value="50">Bet 50</button></div><button class="modal-action-button" data-action="close-dreidel">Leave</button></div>`;
}

export function renderPlayerQuests(quests = [], inventory = []) {
	const inventoryOptions = inventory.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
	const active = quests.map(quest => `<article class="list-row"><strong>${quest.type?.toUpperCase()}</strong><span>${quest.targetId}</span><small>${quest.status}</small></article>`).join('') || '<p class="empty-state">No posted quests.</p>';
	screen('player-quest-screen').innerHTML = `<div class="modal-content wide-modal"><h3>Your Quest Board</h3><div class="form-row"><select id="quest-type-select" class="form-control"><option value="fetch">Fetch</option><option value="kill">Defeat</option></select><select id="quest-target-input" class="form-control"><option value="wheat_bundle">Wheat</option><option value="clay_golem">Golem</option></select><select id="quest-reward-select" class="form-control"><option value="money">Perutah</option>${inventoryOptions}</select><input id="quest-reward-amount" class="form-control" type="number" value="10"><button class="menu-button" data-action="create_quest">Post</button></div><div class="scroll-panel">${active}</div><button class="modal-action-button" data-action="close-player-quests">Close</button></div>`;
}

export function renderGemach(data) {
	document.getElementById('gemach-player-money').textContent = data.playerMoney;
	document.getElementById('gemach-balance').textContent = data.balance;
}
