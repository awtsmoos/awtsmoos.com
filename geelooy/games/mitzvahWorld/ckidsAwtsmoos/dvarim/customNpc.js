
/**
 * B"H
 * @file customNpc.js
 * Represents a custom-designed NPC placed by the player.
 */

import Medabeir from "../chayim/medabeir.js";

export default class CustomNpc extends Medabeir {
    type = "customNpc";
    static itemName = "Custom NPC";
    static description = "A custom designed character.";
    static isBuildable = true; // B"H: Allow placement in the world
    
    constructor(op) {
        // Hydrate from itemData if available
        const customData = op.itemData?.customData || {};
        
        op.name = customData.name || "Anonymous";
        op.placeholderName = op.name;
        
        // Default appearance if none provided (Basic capsule/cylinder combo usually handled by golem if visual is simple)
        if (!op.golem) {
            op.golem = {
                guf: { CylinderGeometry: [0.3, 0.3, 1.8, 16] },
                toyr: { MeshLambertMaterial: { color: customData.color || "#ff00ff" } }
            };
        }
        
        // If the designer set a specific model path (future feature), use it
        if(customData.modelPath) {
            op.path = customData.modelPath;
        } else {
            // Default NPC model
            op.path = "awtsmoos://new_awduhm";
        }

        super(op);
        
        this.customData = customData;
        this.interactable = true;
        this.proximity = 3;
    }

    messageTree(myself) {
        if (this.customData && this.customData.dialogueTree) {
            return this.customData.dialogueTree;
        }
        
        return [
            {
                message: "B\"H\nI am a new creation. My maker gave me no words.",
                responses: [
                    {
                        text: "Goodbye.",
                        close: "See ya!"
                    }
                ]
            }
        ];
    }
}
