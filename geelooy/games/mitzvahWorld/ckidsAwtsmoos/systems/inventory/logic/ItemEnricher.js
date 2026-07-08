
/**
 * B"H
 * @module ItemEnricher
 * @description
 * Chapter 14: The Sefirah of Da'as
 * "And Adam gave names to all cattle, and to the fowl of the air..." (Bereishit 2:20)
 * 
 * Naming is an act of creation. This module takes a raw, formless spark 
 * and bestows upon it an identity. It bridges the gap between a generic 
 * brick and a holy vessel.
 */
import { ITEM_REGISTRY } from "../data/registry.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { CurrencySystem } from "../../../dvarim/currencySystem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class ItemEnricher {
    /**
     * @function run
     * @description Infuses raw item data with metadata from the registry and intelligent defaults.
     */
    static run(itemData) {
        if (!itemData) return null;

        // B"H: Find the archetype in our sacred registry
        const className = itemData.className || "Brick";
        const meta = ITEM_REGISTRY[className] || {};
        
        // Merge the essence
        const res = {
            ...meta,
            ...itemData,
            className: className,
            id: itemData.id || "spark_" + Date.now(),
            quantity: itemData.quantity || 1
        };

        // 1. THE NAMING: Ensure no "Spark of Tohu" remains
        if (!res.name || res.name === "Spark of Tohu") {
             res.name = meta.name || className || "Holy Spark";
        }
        
        if (!res.description || res.description.includes("shattered vessels")) {
             res.description = meta.description || "A physical vessel containing divine light.";
        }

        // 2. THE POTENTIAL: Categorizing behaviors
        res.isBuildable = !!(res.isBuildable || meta.isBuildable);
        res.isTool = !!(res.isTool || meta.isTool);
        res.isPainter = !!(res.isPainter || meta.isPainter);
        res.isContainer = !!(res.isContainer || meta.isContainer || className === 'Container' || (res.customData && res.customData.slots));

        // 3. THE CLOTHING: Assigning equipment slots
        if (!res.equipSlot) {
            const nameLower = res.name.toLowerCase();
            const classLower = className.toLowerCase();
            
            if (classLower === 'apparel') {
                if (nameLower.includes('hat') || nameLower.includes('kippah') || nameLower.includes('yamulka')) res.equipSlot = 'head';
                else if (nameLower.includes('shirt')) res.equipSlot = 'shirt';
                else if (nameLower.includes('pants')) res.equipSlot = 'legs';
                else if (nameLower.includes('glasses')) res.equipSlot = 'eyes';
                else res.equipSlot = 'jacket';
            } else if (res.isTool || res.isBuildable || res.isPainter) {
                res.equipSlot = 'rightHand';
            }
        }

        // Special handling for Currency
        if (className === 'Coin') {
            if (!res.icon) res.icon = CurrencySystem.getBase64Icon(res.value || 1);
            if (!res.name) res.name = CurrencySystem.NAMES[res.value || 1];
        }

        return res;
    }
}
