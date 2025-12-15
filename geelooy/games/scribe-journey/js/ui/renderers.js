
// B"H
// js/ui/renderers.js

export function renderInventory(items) {
    if (!items || items.length === 0) return '<p>Your satchel is empty.</p>';
    return items.map(item => `
        <div class="inventory-item ${item.isQuestItem ? 'quest-item' : ''} rarity-${item.rarity || 'common'}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <strong>${item.name} ${item.isQuestItem ? '(QUEST)' : ''}</strong>
                ${(item.type === 'consumable' || item.type === 'tome' || item.type === 'kli') ? `<button class="menu-button" style="font-size:0.7em; padding:2px 8px;" data-action="use_item" data-value="${item.id}">Use</button>` : ''}
            </div>
            <p style="font-size:0.9em; color:#ccc;">${item.description}</p>
        </div>`).join('');
}

export function renderBattle(state) {
    return ""; 
}

export function renderGates37(data) {
    if(!data) return '';
    return `
        <div class="modal-content" style="max-width: 800px; width: 95%;">
            <h3>The 37 Gates of Wisdom</h3>
            <p style="color:var(--neon-gold)">Wisdom Points: ${data.points}</p>
            <div class="gates-hex-grid">
                ${data.gates.map(g => `
                    <div class="hex-gate ${g.unlocked ? 'unlocked' : 'locked'}" 
                         onclick="${g.canUnlock && !g.unlocked ? `document.querySelector('[data-action=unlockGate37][data-id=${g.id}]').click()` : ''}">
                        <div class="hex-inner">
                            <span class="gate-icon">${g.icon}</span>
                            <span class="gate-name">${g.name}</span>
                            <span class="gate-cost">${g.unlocked ? 'OPEN' : `${g.cost} WP`}</span>
                            ${g.canUnlock && !g.unlocked ? `<button style="display:none;" data-action="unlockGate37" data-id="${g.id}"></button>` : ''}
                        </div>
                        <div class="gate-tooltip">${g.desc}</div>
                    </div>
                `).join('')}
            </div>
            <button class="modal-action-button" data-action="close-gates37">Close</button>
        </div>
    `;
}

export function renderQuestLog(quests) {
    if(!quests || quests.length === 0) return '<p style="text-align:center; padding:20px; color:#999;">No active tasks.</p>';
    
    return quests.map(quest => `
        <div class="quest-log-item status-${quest.status}" style="border-left-color: ${quest.status === 'completed' ? '#0f0' : '#f00'};">
            <div class="quest-header" style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span class="quest-title" style="font-weight:bold;">${quest.name}</span>
                <span class="quest-status-badge" style="font-size:0.8em; background:#333; padding:2px 5px; border-radius:4px;">${quest.status.toUpperCase()}</span>
            </div>
            <div class="quest-desc" style="font-size:0.9em; margin-bottom:10px;">${quest.description}</div>
            <ul class="quest-objectives" style="list-style:none; padding:0;">
                ${quest.objectives.map(obj => `
                    <li class="quest-objective" style="color:${obj.completed ? '#0f0' : '#888'};">
                        ${obj.completed ? '☑' : '☐'} ${obj.text}
                    </li>
                `).join('')}
            </ul>
        </div>
    `).join('');
}
