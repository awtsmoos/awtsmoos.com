//B"H
// js/ui.js

export function initUI(sendToWorker) {
    const screens = {
        'main-menu': document.getElementById('main-menu'),
        'gameMenu': document.getElementById('gameMenu'),
        'battle': document.getElementById('battle-screen'),
        'inventory-screen': document.getElementById('inventory-screen'),
        'quest-log-screen': document.getElementById('quest-log-screen'),
        'game': document.getElementById('gameCanvas') // Treat canvas as a "screen" to show/hide
    };
    const dialogueBox = document.getElementById('dialogue-box');

    // --- Event Delegation ---
    document.body.addEventListener('click', (e) => {
        const button = e.target.closest('button[data-action]');
        if (button) {
            e.preventDefault();
            sendToWorker('uiAction', { action: button.dataset.action });
        }
        
        const choice = e.target.closest('.dialogue-choice');
        if (choice && choice.dataset.choiceIndex) {
            e.preventDefault();
            sendToWorker('dialogueChoice', { index: parseInt(choice.dataset.choiceIndex) });
        }

        const battleBtn = e.target.closest('.battle-button');
        if (battleBtn) {
            e.preventDefault();
            sendToWorker('battleAction', { ...battleBtn.dataset });
        }
    });

    function showScreen(screenName) {
        Object.values(screens).forEach(s => s.style.display = 'none');
        if (screens[screenName]) {
            const display = screenName === 'game' ? 'block' : 'flex';
            screens[screenName].style.display = display;
        } else {
             screens['game'].style.display = 'block'; // Default to game if screen not found
        }
    }
    
    function update(payload) {
        if(payload.screen) showScreen(payload.screen);
        if('dialogue' in payload) updateDialogue(payload.dialogue);
        if(payload.battle) updateBattleUI(payload.battle);
        if(payload.inventory) updateInventory(payload.inventory);
        if(payload.questLog) updateQuestLog(payload.questLog);
    }

    function updateDialogue(state) {
        if (!state.active) {
            dialogueBox.style.display = 'none';
            return;
        }
        dialogueBox.style.display = 'flex';
        document.getElementById('dialogue-text').textContent = state.text;
        const choicesEl = document.getElementById('dialogue-choices');
        choicesEl.innerHTML = '';
        if (state.choices && state.choices.length > 0) {
            document.getElementById('dialogue-continue-indicator').style.display = 'none';
            state.choices.forEach((choice, index) => {
                const choiceEl = document.createElement('div');
                choiceEl.className = `dialogue-choice ${choice.disabled ? 'disabled-choice' : ''}`;
                choiceEl.innerHTML = choice.text; // Use innerHTML to allow for formatting
                choiceEl.dataset.choiceIndex = index;
                choicesEl.appendChild(choiceEl);
            });
        } else {
             document.getElementById('dialogue-continue-indicator').style.display = 'block';
        }
    }

    function updateBattleUI(state) {
        document.getElementById('player-name').textContent = state.player.name;
        document.getElementById('player-level').textContent = `Lv ${state.player.level}`;
        document.getElementById('player-emoji').textContent = state.player.emoji;
        document.getElementById('player-hp-bar').style.width = `${state.player.hpPercent}%`;
        document.getElementById('player-kavanah-bar').style.width = `${state.player.kavanahPercent}%`;
        document.getElementById('opponent-name').textContent = state.opponent.name;
        document.getElementById('opponent-level').textContent = `Lv ${state.opponent.level}`;
        document.getElementById('opponent-emoji').textContent = state.opponent.emoji;
        document.getElementById('opponent-hp-bar').style.width = `${state.opponent.hpPercent}%`;
        
        const battleLog = document.getElementById('battle-log');
        const battleMenu = document.getElementById('battle-menu-container');
        const continueIndicator = document.getElementById('battle-log-continue-indicator');

        if (state.log) {
            battleLog.textContent = state.log;
            battleLog.style.display = 'block';
            battleMenu.style.display = 'none';
            continueIndicator.style.display = state.awaitingConfirm ? 'block' : 'none';
        } else if (state.menu) {
            battleLog.style.display = 'none';
            battleMenu.style.display = 'grid';
            continueIndicator.style.display = 'none';
            battleMenu.innerHTML = state.menu.buttons.map(btn => 
                `<button class="battle-button" 
                         data-action="${btn.action}" 
                         data-value="${btn.value || ''}"
                         ${btn.disabled ? 'disabled' : ''}>
                    ${btn.text}
                </button>`
            ).join('');
        }
    }

    function updateInventory(payload) {
        const list = document.getElementById('inventory-list');
        list.innerHTML = payload.items.length === 0 ? '<p>Your satchel is empty.</p>' : payload.items.map(item => `
            <div class="inventory-item ${item.isQuestItem ? 'quest-item' : ''}">
                <strong>${item.name} ${item.isQuestItem ? '(QUEST ITEM)' : ''}</strong>
                <p>${item.description}</p>
            </div>
        `).join('');
        document.getElementById('player-money-display').innerHTML = `<strong>Wealth:</strong> ${payload.money}`;
    }

    function updateQuestLog(payload) {
        const list = document.getElementById('quest-log-list');
        list.innerHTML = payload.quests.length === 0 ? '<p>No active tasks.</p>' : payload.quests.map(quest => `
            <div class="quest-log-item">
                <h4>${quest.name} (${quest.status})</h4>
                <p>${quest.description}</p>
                <h5>Objectives:</h5>
                <ul>${quest.objectives.map(obj => `<li>${obj.text} ${obj.completed ? '✅' : ''}</li>`).join('')}</ul>
            </div>
        `).join('');
    }

    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    return { update, showToast };
}



