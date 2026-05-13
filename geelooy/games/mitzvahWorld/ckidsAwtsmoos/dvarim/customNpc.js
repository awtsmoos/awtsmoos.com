
/**
 * B"H
 * @file customNpc.js
 * "He breathed into his nostrils the breath of life, and man became a living soul."
 * Represents a dynamically created entity that can wander, speak, and trade.
 */

import Medabeir from "../chayim/medabeir/index.js";
import Utils from "../utils.js";
import NpcBrain from "./npc/Brain.js";
import NpcVisuals from "./npc/Visuals.js";
import IntenseNpcMesh from "./npc/IntenseNpcMesh.js";

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
        
        op.path = customData.modelPath || "https://models-3122d.web.app/chossid.glb";
        op.heesHawveh = true;
        
        if(op.proximity === undefined) op.proximity = 3.5;

        super(op, olam);
        
        if(olam) this.olam = olam;
        if(!this.id) this.id = op.id || Utils.generateID();
        
        this.customData = customData;
        this.quests = customData.quests ||[]; 

        this.shopInventory = customData.shopInventory ||[];
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
            
            // B"H: The Tikkun of Diversity
            // If the creator specified exact garments, we honor them.
            // Otherwise, we spin the kaleidoscope of the Sefirot so they look unique!
            if(this.customData && this.customData.clothes && typeof this.updateAppearance === 'function') {
                this.updateAppearance();
            } else if (typeof this.randomizeAppearance === 'function') {
                this.randomizeAppearance();
            }
        });

        this.messageTree = (myself) => {
             return NpcBrain.getMessageTree(this, this.customData, this.shopInventory);
        };
    }

    async heescheel(olam) {
        if (this.path === "procedural") {
            this.olam = olam;
            const color = this.customData.color || "#ff00ea";
            
            this.mesh = IntenseNpcMesh.build(color);
            this.mesh.name = this.name;
            this.mesh.nivraAwtsmoos = this;
            
            if (this.position) this.mesh.position.copy(this.position.vector3());
            if (this.rotation) this.mesh.rotation.set(this.rotation.x, this.rotation.y, this.rotation.z);
            
            this.mesh.traverse(c => {
                 if(c.isMesh) {
                     c.userData.visualReference = this.mesh;
                     c.nivraAwtsmoos = this;
                 }
            });

            await olam.hoyseef(this);
            this.isReady = true;
        } else {
            await super.heescheel(olam);
        }
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
