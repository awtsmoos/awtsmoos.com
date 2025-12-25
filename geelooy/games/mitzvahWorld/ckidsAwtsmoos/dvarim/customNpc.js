
/**
 * B"H
 * @file customNpc.js
 */

import Medabeir from "../chayim/medabeir.js";
import Utils from "../utils.js";
import * as AWTSMOOS from "../awtsmoosCkidsGames.js";
import { QUEST_STATE } from "../shleechoosHandler.js";

// B"H: Icon SVG Data URIs
const ICON_EXCLAMATION_YELLOW = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNNDUgMTUgTDU1IDE1IEw1MyA2NSBMNDcgNjUgWiBNNDUgNzUgTDU1IDc1IEw1NSA4NSBMNDUgODUgWiIgZmlsbD0iI0ZGRDcwMCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjMiLz48L3N2Zz4=";
const ICON_QUESTION_SILVER = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMzAgMzAgQzMwIDEwIDcwIDEwIDcwIDMwIEM3MCA1MCA1MCA1MCA1MCA3MCBMNTAgODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0MwQzBDMCIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI5MCIgcj0iNSIgZmlsbD0iI0MwQzBDMCIvPjwvc3ZnPg==";
const ICON_QUESTION_YELLOW = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNMzAgMzAgQzMwIDEwIDcwIDEwIDcwIDMwIEM3MCA1MCA1MCA1MCA1MCA3MCBMNTAgODAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI0ZGRDcwMCIgc3Ryb2tlLXdpZHRoPSIxMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSI5MCIgcj0iNSIgZmlsbD0iI0ZGRDcwMCIvPjwvc3ZnPg==";

export default class CustomNpc extends Medabeir {
    type = "customNpc";
    static itemName = "Custom NPC";
    static description = "A custom designed character.";
    static isBuildable = true; 
    
    constructor(op, olam) {
        const customData = op.itemData?.customData || op.customData || {};
        op.name = customData.name || "Anonymous Soul";
        op.placeholderName = op.name;
        
        // B"H: NPCs are not "Solid" in terms of static octree geometry (they move), 
        // but they must be "Interactable" for raycasting.
        op.isSolid = false; 
        op.interactable = true; // Force interactable
        
        op.path = customData.modelPath || "awtsmoos://awduhm";
        op.heesHawveh = true;
        
        if(op.proximity === undefined) op.proximity = 3.5;

        // B"H: Pass olam to super
        super(op, olam);
        
        if(olam) this.olam = olam;
        if(!this.id) this.id = op.id || Utils.generateID();
        
        this.customData = customData;
        this.quests = customData.quests || []; 

        this.shopInventory = customData.shopInventory || [];
        this.balance = customData.balance || 0;
        
        // B"H: Pre-enrich shop items
        if (this.shopInventory) {
            this.shopInventory.forEach(item => {
                if (!item.className) item.className = "Brick"; 
                if (!item.icon) item.icon = ""; 
            });
        }
        
        this.iconState = null;
        
        // Hook into lifecycle
        this.on("ready", () => {
            this.registerMyQuests();
            this.updateOverheadIcon();
        });

        // Dynamic Message Tree to handle Quest Logic AND Shop
        this.messageTree = (myself) => {
             const handler = this.olam ? this.olam.shlichusHandler : null;
             
             // --- 1. Check for Turn-Ins ---
             if (handler) {
                 const turnIns = Array.from(handler.activeQuests.values()).filter(q => 
                     q.returnToId === this.id && q.state === QUEST_STATE.READY_TO_TURN_IN
                 );
                 
                 if (turnIns.length > 0) {
                     const q = turnIns[0];
                     return [{
                         message: "B\"H\nExcellent work on: " + q.title,
                         responses: [{
                             text: "Here is what I found/did.",
                             action: (me) => { q.complete(); me.updateOverheadIcon(); }
                         }]
                     }];
                 }
             }
             
             // --- 2. Check for Available Quests ---
             if (handler) {
                 const available = Array.from(handler.activeQuests.values()).filter(q => 
                     q.giverId === this.id && q.state === QUEST_STATE.AVAILABLE
                 );
                 
                 if (available.length > 0) {
                     const q = available[0];
                     return [{
                         message: "B\"H\n" + (q.description || "I have a mitzvah opportunity for you."),
                         responses: [
                             {
                                 text: "I accept this mission (" + q.title + ")",
                                 action: (me) => { handler.acceptQuest(q.id); me.updateOverheadIcon(); }
                             },
                             { text: "Maybe later.", type: "close" }
                         ]
                     }];
                 }
             }
             
             // --- 3. Check Active (Waiting) ---
             if (handler) {
                 const waiting = Array.from(handler.activeQuests.values()).filter(q => 
                     q.returnToId === this.id && q.state === QUEST_STATE.ACTIVE
                 );
                 
                 if (waiting.length > 0) {
                     // Check if shop is available while waiting
                     const baseResponses = [{ text: "I'm on it.", type: "close" }];
                     if (this.shopInventory && this.shopInventory.length > 0) {
                         baseResponses.push({
                             text: "Can I browse your shop meanwhile?",
                             action: (me) => {
                                 // B"H: Enrich Items!
                                 const rawPlayerItems = me.olam.player.inventory.slots;
                                 const enrichedPlayerItems = rawPlayerItems.map(s => s ? me.olam.player.inventory.enrichItemData(s) : null);
                                 const enrichedShopItems = this.shopInventory.map(s => me.olam.player.inventory.enrichItemData(s));
                                 
                                 me.olam.ayshPeula("ui event", "storeScreen", {
                                     open: { 
                                         entityId: this.id, 
                                         npcName: this.name, 
                                         items: enrichedShopItems,
                                         playerInventory: enrichedPlayerItems 
                                     } 
                                 });
                                 me.ayshPeula("close dialogue", "Take your time.");
                             }
                         });
                     }
                     
                     return [{
                         message: "Hatzlacha! I am waiting for you to complete: " + waiting[0].title,
                         responses: baseResponses
                     }];
                 }
             }

             // --- 4. Default Dialogue + Shop Injection ---
             let tree = this.customData.dialogueTree;
             
             if (!tree || !Array.isArray(tree) || tree.length === 0) {
                 tree = [{ message: "Shalom! How can I help you?", responses: [] }];
             }

             const activeTree = JSON.parse(JSON.stringify(tree));
             
             if (this.shopInventory && this.shopInventory.length > 0) {
                 const rootMsg = activeTree[0];
                 if (rootMsg) {
                     if (!rootMsg.responses) rootMsg.responses = [];
                     
                     const hasShop = rootMsg.responses.some(r => r.text && r.text.toLowerCase().includes("shop"));
                     
                     if (!hasShop) {
                         rootMsg.responses.push({
                             text: "I'd like to browse your wares.",
                             action: (me) => {
                                 const rawPlayerItems = me.olam.player.inventory.slots;
                                 const enrichedPlayerItems = rawPlayerItems.map(s => s ? me.olam.player.inventory.enrichItemData(s) : null);
                                 const enrichedShopItems = this.shopInventory.map(s => me.olam.player.inventory.enrichItemData(s));

                                 me.olam.ayshPeula("ui event", "storeScreen", {
                                     open: { 
                                         entityId: this.id, 
                                         npcName: this.name, 
                                         items: enrichedShopItems,
                                         playerInventory: enrichedPlayerItems 
                                     } 
                                 });
                                 me.ayshPeula("close dialogue", "Let me know if you need anything.");
                             }
                         });
                     }
                 }
             }
             
             if (activeTree[0].responses.length === 0) {
                 activeTree[0].responses.push({ text: "Goodbye.", type: "close" });
             }

             return activeTree;
        };
    }

    registerMyQuests() {
        if (this.olam && this.olam.shlichusHandler && this.quests.length > 0) {
            this.quests.forEach(q => {
                this.olam.shlichusHandler.registerQuest(this, q);
            });
        }
    }

    updateOverheadIcon() {
        if (!this.olam || !this.olam.shlichusHandler) return;
        
        const state = this.olam.shlichusHandler.getNpcState(this.id);
        
        let iconUrl = null;
        if (state === 'READY') iconUrl = ICON_QUESTION_YELLOW;
        else if (state === 'WAITING') iconUrl = ICON_QUESTION_SILVER;
        else if (state === 'AVAILABLE') iconUrl = ICON_EXCLAMATION_YELLOW;
        
        if (this.iconState !== state) {
            this.iconState = state;
            this.iconPath = iconUrl ? "custom_icon" : "chossid.svg"; 
            this.iconType = iconUrl ? "url" : "centered";
            
            if (this.olam.minimap) {
                 this.olam.minimap.removeMinimapItem(this, "npcs");
                 if (iconUrl) {
                     this.getIcon = async () => `<img src="${iconUrl}" style="width:100%;height:100%;" />`;
                     this.olam.minimap.setMinimapItem(this, "npcs");
                 }
            }
        }
    }
}
