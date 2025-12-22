
// B"H
// js/workers/world/dialogue.js

import * as Shop from '../shop.js';
import * as Quests from '../quests.js';

export function startDialogue(state, entity, branch, sendUIUpdate) {
    state.mode = 'dialogue';
    state.dialogue = { active: true, entity, branch, index: 0, choices: [] };
    if (entity.questGiver) {
        const status = Quests.getStatus(state, entity.questGiver);
        if (status === 'completed' && entity.dialogue.completed) state.dialogue.branch = 'completed';
        else if (status === 'in_progress') state.dialogue.branch = 'in_progress';
        else if (status === 'finished') state.dialogue.branch = 'completed'; // Stay on completed text
    }
    advanceDialogue(state, sendUIUpdate);
}

export function advanceDialogue(state, sendUIUpdate, trigger) {
    if (!state.dialogue.active) return;
    const d = state.dialogue;
    const branch = d.entity.dialogue[d.branch];
    if (!branch || d.index >= branch.length) { endDialogue(state, sendUIUpdate); return; }
    
    const msg = branch[d.index];
    if (typeof msg === 'string') {
        if (msg === 'end') { endDialogue(state, sendUIUpdate); return; }
        d.currentText = msg; d.index++;
        sendUIUpdate({ dialogue: { active: true, text: msg } });
    } else {
        // Logic Object
        if (msg.condition) {
            let passed = false;
            if (msg.condition.type === 'hasItem') passed = state.player.inventory.some(i => i.id === msg.condition.itemId);
            if (msg.condition.type === 'flags') passed = msg.condition.flags.every(f => state.player.flags[f]);
            
            if (passed) {
                if (msg.success) {
                     d.index++; // Move to next item which is usually the success text array
                }
            } else {
                if (msg.fail) {
                     sendUIUpdate({ dialogue: { active: true, text: msg.fail[0] } });
                     setTimeout(() => endDialogue(state, sendUIUpdate), 2000);
                     return;
                }
            }
        }

        if (msg.choices) { d.choices = msg.choices; sendUIUpdate({ dialogue: { active: true, text: msg.text || d.currentText, choices: msg.choices } }); }
        else {
             if (msg.startBattle) { endDialogue(state, sendUIUpdate); trigger.startBattle(msg.startBattle, msg.context); return; }
             if (msg.giveItem) Quests.giveItem(state, msg.giveItem, 1, (m)=>trigger.sendToast(m, 'success'));
             if (msg.acceptQuest) trigger.acceptQuest(d.entity.questGiver);
             if (msg.finalizeQuest) trigger.finalizeQuest(d.entity.questGiver);
             if (msg.updateQuest) Quests.updateObjective(state, { type: 'dialogue', flag: msg.objectiveId }, (m)=>trigger.sendToast(m, 'success'));
             if (msg.setFlag) state.player.flags[msg.setFlag] = true;
             
             if (msg.action === 'meditate') { trigger.meditate(); endDialogue(state, sendUIUpdate); return; }
             if (msg.action === 'meditate_ohel') { trigger.meditate_ohel(); endDialogue(state, sendUIUpdate); return; }
             if (msg.action === 'farbrengen_heal') { trigger.farbrengen_heal(); endDialogue(state, sendUIUpdate); return; }
             if (msg.giveRandomItem) { trigger.giveRandomItem(msg.giveRandomItem); }
             if (msg.teleport) { trigger.teleport(msg.teleport); endDialogue(state, sendUIUpdate); return; }
             if (msg.read_parsha) { trigger.read_parsha(); }
             
             if (msg.action === 'openGemach') { endDialogue(state, sendUIUpdate); trigger.openGemach(); return; }
             
             d.index++;
             advanceDialogue(state, sendUIUpdate, trigger);
        }
    }
}

export function handleDialogueChoice(state, index, sendUIUpdate, trigger) {
    const choice = state.dialogue.choices[index];
    if(!choice) return;
    
    // --- SPECIAL ACTIONS HANDLING ---
    if (choice.action === 'ride_ohel') {
        if(state.player.money.perutah >= 50) {
            state.player.money.perutah -= 50;
            state.dialogue.index++; 
            state.dialogue.branch = 'ride_ohel'; 
        } else {
            sendUIUpdate({ dialogue: { active: true, text: "You don't have 50 Perutahs." } });
            setTimeout(() => endDialogue(state, sendUIUpdate), 1500);
            return;
        }
    }
    else if (choice.action === 'give_tzedakah_18') {
        if(state.player.money.perutah >= 18) {
            state.player.money.perutah -= 18;
            state.stats.tzedakahCount = (state.stats.tzedakahCount || 0) + 1;
            Quests.updateObjective(state, {type: 'dialogue', flag: 'given_tzedakah_3'}); // Updates global
            // Continue dialogue normally
        } else {
             sendUIUpdate({ dialogue: { active: true, text: "You lack the funds." } });
             return;
        }
    }
    else if (choice.action === 'give_charity') {
        // Generic charity handler for 500p (Zevulun Quest)
        if(state.player.money.perutah >= 500) {
            state.player.money.perutah -= 500;
            state.dialogue.index++;
            state.dialogue.branch = 'give_charity';
        } else {
            sendUIUpdate({ dialogue: { active: true, text: "You lack the funds." } });
            return;
        }
    }
    
    // GEMACH ACTIONS (Deprecated here, now handled in Gemach Screen, but kept for legacy)
    else if (choice.action === 'gemach_deposit') {
        trigger.gemach_deposit(choice.amount);
        state.dialogue.text = `Deposited ${Math.abs(choice.amount)}. May it bear fruit.`;
        sendUIUpdate({ dialogue: state.dialogue }); 
        return; 
    }
    else if (choice.action === 'gemach_withdraw') {
        trigger.gemach_withdraw(choice.amount);
        state.dialogue.text = `Withdrew ${choice.amount}. Use it for Mitzvot.`;
        sendUIUpdate({ dialogue: state.dialogue });
        return;
    }

    if (state.dialogue.entity.shop) Shop.handleShopChoice(state, choice, sendUIUpdate);
    else {
        state.dialogue.index++;
        if (choice.next) { state.dialogue.branch = choice.next; state.dialogue.index = 0; advanceDialogue(state, sendUIUpdate, trigger); }
        else endDialogue(state, sendUIUpdate);
    }
}

function endDialogue(state, sendUIUpdate) {
    state.dialogue.active = false; state.mode = 'game';
    sendUIUpdate({ dialogue: { active: false } });
}
