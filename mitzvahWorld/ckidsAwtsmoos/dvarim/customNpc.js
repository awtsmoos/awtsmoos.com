
/**
 * B"H
 * @file customNpc.js
 */

import Medabeir from "../chayim/medabeir/index.js";
import Utils from "../utils.js";
import NpcBrain from "./npc/Brain.js";
import NpcVisuals from "./npc/Visuals.js";

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
        op.interactable = true; 
        
        op.path = customData.modelPath || "awtsmoos://awduhm";
        op.heesHawveh = true;
        
        if(op.proximity === undefined) op.proximity = 3.5;

        super(op, olam);
        
        if(olam) this.olam = olam;
        if(!this.id) this.id = op.id || Utils.generateID();
        
        this.customData = customData;
        this.quests = customData.quests || []; 

        this.shopInventory = customData.shopInventory || [];
        this.balance = customData.balance || 0;
        
        if (this.shopInventory) {
            this.shopInventory.forEach(item => {
                if (!item.className) item.className = "Brick"; 
                if (!item.icon) item.icon = ""; 
            });
        }
        
        this.iconState = null;
        
        this.on("ready", () => {
            this.registerMyQuests();
            this.updateOverheadIcon();
        });

        this.messageTree = (myself) => {
             return NpcBrain.getMessageTree(this, this.customData, this.shopInventory);
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
        NpcVisuals.updateOverheadIcon(this);
    }
}
