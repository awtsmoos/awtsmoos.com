/**
 * B"H
 * @file Kelipa.js
 * @description
 * 🐚 THE HUSK OF IMPURITY 🐚
 * 
 * Chapter 9: The Opposing Force.
 * "G-d has made one opposite the other" (Kohelet 7:14)
 * 
 * Kelipos are the husks that conceal the holy sparks. 
 * They manifest in different elemental forms (Fire, Water, Ground, Air)
 * corresponding to different unrefined human traits.
 */

import Mazik from "../mazik.js";
import * as THREE from '/games/scripts/build/three.module.js';

export const KELIPA_TYPES = {
    GROUND: { name: "Earthly Desire", color: 0x4e342e, weakness: "Ground" },
    WATER: { name: "Cold Pleasure", color: 0x01579b, weakness: "Water" },
    FIRE: { name: "Arrogant Heat", color: 0xb71c1c, weakness: "Fire" },
    AIR: { name: "Empty Words", color: 0x455a64, weakness: "Air" }
};

export default class Kelipa extends Mazik {
    type = "kelipa";
    
    constructor(options, olam) {
        const kTypeKey = options.kelipaType || Object.keys(KELIPA_TYPES)[Math.floor(Math.random() * 4)];
        const kType = KELIPA_TYPES[kTypeKey];
        
        options.color = kType.color;
        options.name = kType.name + " Husk";
        
        super(options, olam);
        
        this.kelipaType = kTypeKey;
        this.kTypeName = kType.name;
        this.weakness = kType.weakness;
        
        // B"H: Unique moves for Kelipos
        this.moves = [
            { name: "Debate", type: "mental", damage: 15, msg: "The Kelipa questions your faith!" },
            { name: "Distraction", type: "spiritual", damage: 10, msg: "The Kelipa offers a cold pleasure." }
        ];
    }

    /**
     * B"H: Challenge a player to a Torah debate or battle.
     */
    startBattle(chossid) {
        if (this.olam && this.olam.battleManager) {
            this.olam.battleManager.initiate(chossid, this);
        }
    }

    /**
     * B"H: Overriding takeDamage to include elemental effectiveness.
     */
    takeDamage(amount, sourceDamageType) {
        let finalAmount = amount;
        
        if (sourceDamageType === this.weakness) {
            finalAmount *= 2; // Critical hit!
            if (this.olam) {
                this.olam.ayshPeula("ui event", "toast", { 
                    message: `B"H! A Holy Spark has pierced the ${this.kTypeName}!`,
                    type: "success"
                });
            }
        }

        super.takeDamage(finalAmount);
    }
}
