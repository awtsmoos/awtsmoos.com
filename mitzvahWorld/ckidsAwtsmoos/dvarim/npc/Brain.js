
// B"H
import { QUEST_STATE } from "../../systems/quests/Shlichus.js";

export default class NpcBrain {
    static getMessageTree(npc, customData, shopInventory) {
        const handler = npc.olam ? npc.olam.shlichusHandler : null;

        if (handler) {
            const turnIns = Array.from(handler.activeQuests.values()).filter(q => 
                q.returnToId === npc.id && q.state === QUEST_STATE.READY_TO_TURN_IN
            );
            
            if (turnIns.length > 0) {
                const q = turnIns[0];
                return [{
                    message: "B\"H\nExcellent work on: " + q.title,
                    responses: [{
                        text: "Here is what I found/did.",
                        action: (me) => { q.complete(); if(me.updateOverheadIcon) me.updateOverheadIcon(); }
                    }]
                }];
            }
        }
        
        if (handler) {
            const available = Array.from(handler.activeQuests.values()).filter(q => 
                q.giverId === npc.id && q.state === QUEST_STATE.AVAILABLE
            );
            
            if (available.length > 0) {
                const q = available[0];
                return [{
                    message: "B\"H\n" + (q.description || "I have a mitzvah opportunity for you."),
                    responses: [
                        {
                            text: "I accept this mission (" + q.title + ")",
                            action: (me) => { handler.acceptQuest(q.id); if(me.updateOverheadIcon) me.updateOverheadIcon(); }
                        },
                        { text: "Maybe later.", type: "close" }
                    ]
                }];
            }
        }
        
        if (handler) {
            const waiting = Array.from(handler.activeQuests.values()).filter(q => 
                q.returnToId === npc.id && q.state === QUEST_STATE.ACTIVE
            );
            
            if (waiting.length > 0) {
                const baseResponses = [{ text: "I'm on it.", type: "close" }];
                if (shopInventory && shopInventory.length > 0) {
                    baseResponses.push({
                        text: "Can I browse your shop meanwhile?",
                        action: (me) => NpcBrain.openShop(me, shopInventory)
                    });
                }
                
                return [{
                    message: "Hatzlacha! I am waiting for you to complete: " + waiting[0].title,
                    responses: baseResponses
                }];
            }
        }

        let tree = customData.dialogueTree;
        if (!tree || !Array.isArray(tree) || tree.length === 0) {
            tree = [{ message: "Shalom! How can I help you?", responses: [] }];
        }

        const activeTree = JSON.parse(JSON.stringify(tree));
        
        if (shopInventory && shopInventory.length > 0) {
            const rootMsg = activeTree[0];
            if (rootMsg) {
                if (!rootMsg.responses) rootMsg.responses = [];
                const hasShop = rootMsg.responses.some(r => r.text && r.text.toLowerCase().includes("shop"));
                
                if (!hasShop) {
                    rootMsg.responses.push({
                        text: "I'd like to browse your wares.",
                        action: (me) => NpcBrain.openShop(me, shopInventory)
                    });
                }
            }
        }
        
        if (activeTree[0].responses.length === 0) {
            activeTree[0].responses.push({ text: "Goodbye.", type: "close" });
        }

        return activeTree;
    }

    static openShop(me, shopInventory) {
        if (!me.olam.player || !me.olam.player.inventory) return;
        
        const rawPlayerItems = me.olam.player.inventory.slots;
        const enrichedPlayerItems = rawPlayerItems.map(s => s ? me.olam.player.inventory.enrichItemData(s) : null);
        const enrichedShopItems = shopInventory.map(s => me.olam.player.inventory.enrichItemData(s));

        me.olam.ayshPeula("ui event", "storeScreen", {
            open: { 
                entityId: me.id, 
                npcName: me.name, 
                items: enrichedShopItems,
                playerInventory: enrichedPlayerItems 
            } 
        });
        me.ayshPeula("close dialogue", "Let me know if you need anything.");
    }
}
