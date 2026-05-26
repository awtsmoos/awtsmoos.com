
// B"H
// js/ui/renderers.js

const EMPTY_TASKS = '<p class="empty-state">No active tasks.</p>';
const EMPTY_SATCHEL = '<p class="empty-state">Your satchel is empty.</p>';

export function renderInventory(items) {
    if (!items || items.length === 0) return EMPTY_SATCHEL;
    return items.map(item => `
        <div class="inventory-item ${item.isQuestItem ? 'quest-item' : ''} rarity-${item.rarity || 'common'}">
            <div class="item-row">
                <strong>${item.name} ${item.isQuestItem ? '(QUEST)' : ''}</strong>
                ${canUseItem(item) ? `<button class="menu-button compact-button" data-action="use_item" data-value="${item.id}">Use</button>` : ''}
            </div>
            <p class="muted-copy">${item.description}</p>
        </div>`).join('');
}


export function renderGates37(data) {
    if (!data) return '';
    return `
        <div class="modal-content wide-modal">
            <h3>The 37 Gates of Wisdom</h3>
            <p class="gold-copy">Wisdom Points: ${data.points}</p>
            <div class="gates-hex-grid">
                ${data.gates.map(gate => renderGate37(gate)).join('')}
            </div>
            <button class="modal-action-button" data-action="close-gates37">Close</button>
        </div>`;
}

export function renderQuestLog(quests) {
    if (!quests || quests.length === 0) return EMPTY_TASKS;
    return quests.map(quest => `
        <div class="quest-log-item status-${quest.status}">
            <div class="quest-header">
                <span class="quest-title">${quest.name}</span>
                <span class="quest-status-badge">${quest.status.toUpperCase()}</span>
            </div>
            <div class="quest-desc">${quest.description}</div>
            <ul class="quest-objectives">
                ${quest.objectives.map(renderObjective).join('')}
            </ul>
        </div>`).join('');
}

function canUseItem(item) {
    return item.type === 'consumable' || item.type === 'tome' || item.type === 'kli';
}

function renderGate37(gate) {
    const unlockAction = gate.canUnlock && !gate.unlocked
        ? `document.querySelector('[data-action=unlockGate37][data-id=${gate.id}]').click()`
        : '';
    const hiddenUnlocker = gate.canUnlock && !gate.unlocked
        ? `<button class="hidden-action" data-action="unlockGate37" data-id="${gate.id}"></button>`
        : '';
    return `
        <div class="hex-gate ${gate.unlocked ? 'unlocked' : 'locked'}" onclick="${unlockAction}">
            <div class="hex-inner">
                <span class="gate-icon">${gate.icon}</span>
                <span class="gate-name">${gate.name}</span>
                <span class="gate-cost">${gate.unlocked ? 'OPEN' : `${gate.cost} WP`}</span>
                ${hiddenUnlocker}
            </div>
            <div class="gate-tooltip">${gate.desc}</div>
        </div>`;
}

function renderObjective(objective) {
    return `
        <li class="quest-objective ${objective.completed ? 'is-complete' : ''}">
            ${objective.completed ? '☑' : '☐'} ${objective.text}
        </li>`;
}
