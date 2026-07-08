//B"H
import Tool from "../tool.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default class FishingRod extends Tool {
    constructor(op, olam) { super(op); this.olam = olam; }
    async shoot() { 
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Casting line...", color: "cyan" }); 
        
        // Wait a moment then maybe catch something
        setTimeout(() => {
            if (Math.random() > 0.5) {
                this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Caught a Kosher Fish!", color: "blue" }); 
                const player = this.olam.player || this.olam.chossid;
                if (player && player.inventory) {
                    player.inventory.addItem({
                        id: "food_fish",
                        className: "Apparel", // We can use generic Apparel or Brick for food if no specific Food class
                        name: "Kosher Fish",
                        description: "Provides sustenance and Koach.",
                        sellValue: 20
                    });
                }
            } else {
                this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Not even a nibble...", color: "gray" }); 
            }
        }, 2000);
    }
}