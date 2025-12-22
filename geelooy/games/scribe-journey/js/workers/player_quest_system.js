
// B"H
// js/workers/player_quest_system.js

import * as Quests from './quests.js';

export function createPlayerQuest(state, type, targetId, rewardId, rewardAmount, sendToast) {
    if (!state.player.postedQuests) state.player.postedQuests = [];

    // 1. Check if player has the reward to offer
    if (rewardId === 'money') {
        if ((state.player.money.perutah || 0) < rewardAmount) {
            sendToast("You don't have enough money to offer this reward!", "error");
            return;
        }
        state.player.money.perutah -= rewardAmount;
    } else {
        const itemIdx = state.player.inventory.findIndex(i => i.id === rewardId);
        if (itemIdx === -1) {
            sendToast("You don't have that item!", "error");
            return;
        }
        state.player.inventory.splice(itemIdx, 1);
    }

    // 2. Create the Quest Object
    const questId = `pq_${Date.now()}`;
    const quest = {
        id: questId,
        type: type, // 'fetch', 'kill'
        targetId: targetId,
        reward: { type: rewardId === 'money' ? 'money' : 'item', id: rewardId, amount: rewardAmount },
        assignee: null,
        status: 'open', // open, in_progress, completed_waiting
        timestamp: Date.now()
    };

    state.player.postedQuests.push(quest);
    sendToast("Quest Posted! Wait for a bot to accept it.", "success");
}

export function assignQuestToBot(state, bot, sendUIUpdate, sendToast) {
    const openQuest = state.player.postedQuests.find(q => q.status === 'open');
    if (!openQuest) return false;

    openQuest.status = 'in_progress';
    openQuest.assignee = bot.id;
    openQuest.startTime = Date.now();
    
    bot.state = 'QUESTING';
    bot.questId = openQuest.id;
    bot.questTimer = 10000 + Math.random() * 20000; // 10-30 seconds to complete
    
    sendToast(`${bot.name} accepted your quest!`, "info");
    return true;
}

export function completePlayerQuest(state, bot, sendUIUpdate, sendToast) {
    const quest = state.player.postedQuests.find(q => q.id === bot.questId);
    if (!quest) return;

    // 1. Give player the target item (if fetch)
    if (quest.type === 'fetch') {
        Quests.giveItem(state, quest.targetId, 1);
        sendToast(`${bot.name} returned with the goods!`, "success");
    } else {
        sendToast(`${bot.name} completed the kill mission.`, "success");
    }

    // 2. Remove quest
    state.player.postedQuests = state.player.postedQuests.filter(q => q.id !== quest.id);
    
    // 3. Reset Bot
    bot.state = 'IDLE';
    bot.questId = null;
    bot.inventory.push({ itemId: quest.reward.id, price: 0 }); // Bot keeps the reward (simulated)
    
    // 4. Reward dialogue
    const rewardName = quest.reward.type === 'money' ? `${quest.reward.amount}p` : state.db.items[quest.reward.id].name;
    
    return {
        text: `${bot.name}: "I have finished the task. Thank you for the ${rewardName}!"`,
        choices: [{ text: "Good job.", next: "end" }]
    };
}
