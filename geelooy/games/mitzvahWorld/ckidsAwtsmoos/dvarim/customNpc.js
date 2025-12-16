
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
        op.isSolid = false; 
        op.path = customData.modelPath || "awtsmoos://awduhm";
        op.heesHawveh = true;

        super(op);
        
        if(olam) this.olam = olam;
        if(!this.id) this.id = op.id || Utils.generateID();
        
        this.customData = customData;
        this.quests = customData.quests || []; // List of quest definitions

        // ... existing properties ...
        this.shopInventory = customData.shopInventory || [];
        this.balance = customData.balance || 0;
        
        this.iconState = null;
        
        // Hook into lifecycle
        this.on("ready", () => {
            this.registerMyQuests();
            this.updateOverheadIcon();
        });

        // Dynamic Message Tree to handle Quest Logic
        this.messageTree = (myself) => {
             const handler = this.olam.shlichusHandler;
             if (!handler) return [{ message: "...", responses: [] }];
             
             // 1. Check for Turn-Ins
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
             
             // 2. Check for Available Quests
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
             
             // 3. Check Active (Waiting)
             const waiting = Array.from(handler.activeQuests.values()).filter(q => 
                 q.returnToId === this.id && q.state === QUEST_STATE.ACTIVE
             );
             
             if (waiting.length > 0) {
                 return [{
                     message: "Hatzlacha! I am waiting for you to complete: " + waiting[0].title,
                     responses: [{ text: "I'm on it.", type: "close" }]
                 }];
             }

             // 4. Default Dialogue
             return this.customData.dialogueTree || [{ message: "Shalom!", responses: [{ text: "Bye", type: "close" }] }];
        };
    }

    registerMyQuests() {
        if (this.olam.shlichusHandler && this.quests.length > 0) {
            this.quests.forEach(q => {
                this.olam.shlichusHandler.registerQuest(this, q);
            });
        }
    }

    updateOverheadIcon() {
        if (!this.olam.shlichusHandler) return;
        
        const state = this.olam.shlichusHandler.getNpcState(this.id);
        
        let iconUrl = null;
        if (state === 'READY') iconUrl = ICON_QUESTION_YELLOW;
        else if (state === 'WAITING') iconUrl = ICON_QUESTION_SILVER;
        else if (state === 'AVAILABLE') iconUrl = ICON_EXCLAMATION_YELLOW;
        
        if (this.iconState !== state) {
            this.iconState = state;
            // Update Minimap Icon
            this.iconPath = iconUrl ? "custom_icon" : "chossid.svg"; // Use fallback if null
            this.iconType = iconUrl ? "url" : "centered";
            
            // Send update to Minimap system
            // We use a property bag that Minimap checks, or trigger a refresh
            if (this.olam.minimap) {
                 // Hack: remove and re-add to refresh icon
                 this.olam.minimap.removeMinimapItem(this, "npcs");
                 if (iconUrl) {
                     // Monkey-patch getIcon for this instance to return the Data URI
                     this.getIcon = async () => `<img src="${iconUrl}" style="width:100%;height:100%;" />`;
                     this.olam.minimap.setMinimapItem(this, "npcs");
                 }
            }
        }
    }
}
