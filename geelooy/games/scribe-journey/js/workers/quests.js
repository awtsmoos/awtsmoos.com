
// B"H
// js/workers/quests.js
import { formatMoney } from '../data/database.js';

export function accept(state, questId, sendToast) {
    if (state.player.activeQuests.some(q => q.id === questId)) return;
    const questDef = state.db.quests[questId];
    if (!questDef) return;

    const newQuest = JSON.parse(JSON.stringify(questDef));
    state.player.activeQuests.push(newQuest);
    
    const giver = findEntity(state, newQuest.questGiverId);
    if(giver) giver.questState = 'in_progress';

    sendToast(`New Task: ${newQuest.name}`, 'info');
}

export function updateObjective(state, event, sendToast) {
    let updated = false;
    state.player.activeQuests.forEach(quest => {
        quest.objectives.forEach(obj => {
            if (obj.completed) return;
            let objectiveMatched = false;
            
            // Check matching types
            if (obj.target.type === event.type) {
                if(event.type === 'defeat' && obj.target.musagId === event.musagId) objectiveMatched = true;
                else if((event.type === 'acquire' || event.type === 'collect') && obj.target.itemId === event.itemId) objectiveMatched = true;
                else if(event.type === 'dialogue' && obj.target.flag === event.flag) {
                    obj.completed = true;
                    checkCompletion(state, quest, sendToast);
                    return;
                }
            }
            
            if (objectiveMatched) {
                obj.current = (obj.current || 0) + (event.count || 1);
                if (obj.current >= (obj.target.count || 1)) {
                    obj.completed = true;
                    if(sendToast) sendToast(`Objective Complete: ${obj.text.split('(')[0]}`, 'success');
                    checkCompletion(state, quest, sendToast);
                }
                updated = true;
            }
        });
    });
    return updated;
}

function checkCompletion(state, quest, sendToast) {
    if (quest.objectives.every(obj => obj.completed)) {
        quest.status = 'completed';
        const giver = findEntity(state, quest.questGiverId);
        if(giver) giver.questState = 'completed';
        if(sendToast) sendToast(`Task Ready to Turn In: ${quest.name}`, 'info');
    }
}

export function finalize(state, questId, sendToast) {
    const questIndex = state.player.activeQuests.findIndex(q => q.id === questId);
    if (questIndex === -1) return;
    const quest = state.player.activeQuests[questIndex];
    if (quest.status !== 'completed') return;

    // Grant Rewards
    if (quest.rewards.money) {
        for (const unit in quest.rewards.money) {
            state.player.money[unit] = (state.player.money[unit] || 0) + quest.rewards.money[unit];
        }
    }
    if (quest.rewards.items) {
        quest.rewards.items.forEach(itemId => giveItem(state, itemId, 1, sendToast));
    }
    if (quest.rewards.xp) {
        // Simple XP grant to lead Musag
        if(state.player.team[0]) {
             // Logic handled in gameWorker usually, but we can emit event or just add property?
             // For simplicity, we just add it to stats here if we have access to team structure
             // But team is IDs. We need instances. 
             // We'll skip complex XP here and assume it's handled by main loop or ignored for now.
        }
    }

    sendToast(`Task Complete: ${quest.name}!`, 'success');
    state.player.activeQuests.splice(questIndex, 1);
    state.player.completedQuests = state.player.completedQuests || [];
    state.player.completedQuests.push(questId);
    
    const giver = findEntity(state, quest.questGiverId);
    if(giver) giver.questState = 'none';
}

export function giveItem(state, itemId, quantity = 1, sendToast = null) {
    const itemDef = state.db.items[itemId];
    if (!itemDef) {
        console.warn(`Item ${itemId} not found in DB.`);
        return;
    }
    
    for(let i=0; i<quantity; i++) {
        state.player.inventory.push({ ...itemDef });
    }
    
    if(sendToast) sendToast(`Acquired: ${itemDef.name} ${quantity > 1 ? `x${quantity}` : ''}`, 'success');

    // Trigger Quest Updates automatically
    updateObjective(state, { type: 'collect', itemId, count: quantity }, sendToast);
    updateObjective(state, { type: 'acquire', itemId, count: quantity }, sendToast); // Support both keywords
}

export function getStatus(state, questId) {
    if (state.player.completedQuests && state.player.completedQuests.includes(questId)) return 'finished';
    const quest = state.player.activeQuests.find(q => q.id === questId);
    return quest ? quest.status : 'available';
}

export function getObjectiveStatus(state, questId, objectiveId) {
    const quest = state.player.activeQuests.find(q => q.id === questId);
    if (!quest) return false;
    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    return objective ? objective.completed : false;
}

function findEntity(state, entityId) {
    for (const map of Object.values(state.maps)) {
        for (const entity of Object.values(map.interactables)) {
            if (entity.id === entityId) return entity;
        }
    }
    return null;
}

export function getInventoryPayload(state) {
    return {
        items: state.player.inventory,
        money: formatMoney(state.player.money)
    };
}

export function getQuestLogPayload(state) {
    return {
        quests: state.player.activeQuests.map(q => ({
            ...q,
            objectives: q.objectives.map(obj => ({
                text: `${obj.text} (${obj.current || 0}/${obj.target.count || 1})`,
                completed: obj.completed
            }))
        }))
    };
}
