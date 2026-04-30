
import SederHishtalshelusNode from '../../core/SederHishtalshelusNode.js';

/**
 * B"H
 * @file SparkElevator.js
 * 
 * Chapter: The Altar of Intent.
 * When an item in the inventory is clicked, it does not merely "vanish" or "run a function."
 * It is Elevated. Its physical shell (data matrix coordinate) is shattered, and 
 * its inner spiritual intent (effect) is released into the Player's soul.
 * 
 * Pure data mappings map Item Types to their divine elevations.
 */

/**
 * @class SparkElevator
 * @extends SederHishtalshelusNode
 * @description Orchestrates the consumption/use of an item from the matrix.
 */
export default class SparkElevator extends SederHishtalshelusNode {
    /**
     * @constructor
     * @param {Object} inventoryMatrixRef - The Matrix to pull the item from.
     * @param {Object} playerSoulRef - The pure state object of the player.
     */
    constructor(inventoryMatrixRef, playerSoulRef) {
        super({ worldName: "Atzilut_Elevation_Altar" });
        this.inventoryMatrix = inventoryMatrixRef;
        this.playerSoul = playerSoulRef;

        /**
         * Pure map of spiritual reactions. No switch statements.
         */
        this.elevationReactions = {
            'FOOD_APPLE': (spark) => this.elevateApple(spark),
            'TRACTATE_GEMARA': (spark) => this.elevateGemara(spark),
            'MYSTIC_TEFILLIN': (spark) => this.elevateTefillin(spark)
        };
    }

    /**
     * @method performElevation
     * @description Triggers the consumption logic of an item.
     * @param {string} itemId 
     */
    performElevation(itemId) {
        this.acknowledgeCreator();

        const spark = this.inventoryMatrix.extractSpark(itemId);
        if (!spark) {
            console.error(`B"H - 🚨 Cannot elevate what does not exist in the vessels!`);
            return;
        }

        const reaction = this.elevationReactions[spark.type];
        if (reaction) {
            console.log(`B"H - 🔥 Beginning elevation sequence for [${spark.name}]...`);
            reaction(spark);
        } else {
            console.warn(`B"H - ⚠️ Spark [${spark.type}] lacks an elevation path. It returns to Tohu.`);
        }
    }

    /**
     * @method elevateApple
     * @description Releases the divine energy of physical sustenance.
     */
    elevateApple(spark) {
        this.playerSoul.energy = Math.min(100, (this.playerSoul.energy || 0) + 20);
        console.log(`B"H - 🍎 Bracha recited. 20 energy restored to the physical vessel.`);
    }

    /**
     * @method elevateGemara
     * @description Elevates the mind through the Torah of the Amoraim.
     */
    elevateGemara(spark) {
        this.playerSoul.wisdom = (this.playerSoul.wisdom || 0) + 50;
        console.log(`B"H - 📖 Deep learning engaged. 50 Wisdom gained.`);
    }

    /**
     * @method elevateTefillin
     * @description Binds the intellect and emotions to the Awtsmoos.
     */
    elevateTefillin(spark) {
        this.playerSoul.connectionLevel = 'INFINITE';
        console.log(`B"H - ⬛ Tefillin bound. The soul is utterly nullified and connected.`);
    }
}
