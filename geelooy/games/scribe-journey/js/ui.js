// B"H
// js/ui.js

export function initUI(sendToWorker) {
    // Add Shem screen to the list of managed screens
    const screens = {
        'main-menu': document.getElementById('main-menu'),
        'gameMenu': document.getElementById('gameMenu'),
        'battle': document.getElementById('battle-screen'),
        'inventory-screen': document.getElementById('inventory-screen'),
        'quest-log-screen': document.getElementById('quest-log-screen'),
        'shem-screen': document.getElementById('shem-screen'),
        'game': document.getElementById('gameCanvas')
    };
    const dialogueBox = document.getElementById('dialogue-box');

    // --- Create the new Shem Screen dynamically ---
    const shemScreen = document.createElement('div');
    shemScreen.id = 'shem-screen';
    shemScreen.className = 'menu-screen';
    document.getElementById('gameContainer').appendChild(shemScreen);
    screens['shem-screen'] = shemScreen;

    // (Event listeners remain the same as before)
    document.body.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (button) { e.preventDefault(); sendToWorker('uiAction', { action: button.dataset.action }); }
        const choice = e.target.closest('.dialogue-choice');
        if (choice && choice.dataset.choiceIndex) { e.preventDefault(); sendToWorker('dialogueChoice', { index: parseInt(choice.dataset.choiceIndex) }); }
        const battleBtn = e.target.closest('.battle-button');
        if (battleBtn) { e.preventDefault(); sendToWorker('battleAction', { ...battleBtn.dataset }); }
    });


    function showScreen(screenName) {
        Object.values(screens).forEach(s => { if(s) s.style.display = 'none' });
        if (screens[screenName]) {
            const display = screenName === 'game' ? 'block' : 'flex';
            screens[screenName].style.display = display;
        } else {
             screens['game'].style.display = 'block';
        }
    }
    
    function update(payload) {
        if(payload.screen) showScreen(payload.screen);
        if('dialogue' in payload) updateDialogue(payload.dialogue);
        if(payload.battle) updateBattleUI(payload.battle);
        if(payload.inventory) updateInventory(payload.inventory);
        if(payload.questLog) updateQuestLog(payload.questLog);
        if(payload.shem) updateShemScreen(payload.shem); // New handler
    }

    // --- NEW FUNCTION to render the Shem (Team) screen ---
    function updateShemScreen(payload) {
        const content = `
            <div class="modal-content">
                <h3>Your Shem (Team)</h3>
                <div id="shem-list">
                    ${payload.team.map(musag => `
                        <div class="musag-summary">
                            <div class="musag-summary-header">
                                <span class="musag-emoji">${musag.emoji}</span>
                                <div>
                                    <strong>${musag.name}</strong> - Lv ${musag.level}
                                    <div class="health-bar"><div class="health-bar-inner" style="width: ${(musag.currentHp / musag.maxHp) * 100}%"></div></div>
                                    <div class="kavanah-bar"><div class="kavanah-bar-inner" style="width: ${(musag.currentKavanah / musag.maxKavanah) * 100}%"></div></div>
                                </div>
                            </div>
                            <div class="musag-stats-grid">
                                <span>HP: ${musag.currentHp} / ${musag.maxHp}</span>
                                <span>Attack: ${musag.stats.attack}</span>
                                <span>Defense: ${musag.stats.defense}</span>
                                <span>Diligence: ${musag.stats.diligence}</span>
                            </div>
                            <div class="musag-moves-list">
                                <strong>Moves:</strong>
                                ${musag.moves.map(move => `
                                    <div class="move-entry">
                                        <span><strong>${move.name}</strong> (${move.cost} Kav)</span>
                                        <span>${move.desc}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="modal-action-button" data-action="close-shem">Close</button>
            </div>
        `;
        shemScreen.innerHTML = content;
    }


    // (All other UI functions like updateDialogue, updateBattleUI, etc. remain the same)
    // ...
    function updateDialogue(state) { if (!state.active) { dialogueBox.style.display = 'none'; return; } dialogueBox.style.display = 'flex'; document.getElementById('dialogue-text').textContent = state.text; const choicesEl = document.getElementById('dialogue-choices'); choicesEl.innerHTML = ''; if (state.choices && state.choices.length > 0) { document.getElementById('dialogue-continue-indicator').style.display = 'none'; state.choices.forEach((choice, index) => { const choiceEl = document.createElement('div'); choiceEl.className = `dialogue-choice ${choice.disabled ? 'disabled-choice' : ''}`; choiceEl.innerHTML = choice.text; choiceEl.dataset.choiceIndex = index; choicesEl.appendChild(choiceEl); }); } else { document.getElementById('dialogue-continue-indicator').style.display = 'block'; } }
    function updateBattleUI(state) { document.getElementById('player-name').textContent = state.player.name; document.getElementById('player-level').textContent = `Lv ${state.player.level}`; document.getElementById('player-emoji').textContent = state.player.emoji; document.getElementById('player-hp-bar').style.width = `${state.player.hpPercent}%`; document.getElementById('player-kavanah-bar').style.width = `${state.player.kavanahPercent}%`; document.getElementById('opponent-name').textContent = state.opponent.name; document.getElementById('opponent-level').textContent = `Lv ${state.opponent.level}`; document.getElementById('opponent-emoji').textContent = state.opponent.emoji; document.getElementById('opponent-hp-bar').style.width = `${state.opponent.hpPercent}%`; const battleLog = document.getElementById('battle-log'); const battleMenu = document.getElementById('battle-menu-container'); const continueIndicator = document.getElementById('battle-log-continue-indicator'); if (state.log) { battleLog.textContent = state.log; battleLog.style.display = 'block'; battleMenu.style.display = 'none'; continueIndicator.style.display = state.awaitingConfirm ? 'block' : 'none'; } else if (state.menu) { battleLog.style.display = 'none'; battleMenu.style.display = 'grid'; continueIndicator.style.display = 'none'; battleMenu.innerHTML = state.menu.buttons.map(btn => `<button class="battle-button" data-action="${btn.action}" data-value="${btn.value || ''}" ${btn.disabled ? 'disabled' : ''}>${btn.text}</button>`).join(''); } }
    function updateInventory(payload) { const list = document.getElementById('inventory-list'); list.innerHTML = payload.items.length === 0 ? '<p>Your satchel is empty.</p>' : payload.items.map(item => `<div class="inventory-item ${item.isQuestItem ? 'quest-item' : ''}"><strong>${item.name} ${item.isQuestItem ? '(QUEST ITEM)' : ''}</strong><p>${item.description}</p></div>`).join(''); document.getElementById('player-money-display').innerHTML = `<strong>Wealth:</strong> ${payload.money}`; }
    function updateQuestLog(payload) { const list = document.getElementById('quest-log-list'); list.innerHTML = payload.quests.length === 0 ? '<p>No active tasks.</p>' : payload.quests.map(quest => `<div class="quest-log-item"><h4>${quest.name} (${quest.status})</h4><p>${quest.description}</p><h5>Objectives:</h5><ul>${quest.objectives.map(obj => `<li>${obj.text} ${obj.completed ? '✅' : ''}</li>`).join('')}</ul></div>`).join(''); }
    function showToast(message, type = 'info') { const container = document.getElementById('toast-container'); const toast = document.createElement('div'); toast.className = `toast toast-${type}`; toast.textContent = message; container.appendChild(toast); setTimeout(() => toast.remove(), 3000); }


    return { update, showToast };
}