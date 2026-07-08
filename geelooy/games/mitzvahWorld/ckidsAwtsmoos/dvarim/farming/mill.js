//B"H
/**
 * Mill - Grinds wheat into flour.
 */
import Domem from "../../chayim/domem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class Mill extends Domem {
    async heescheel(olam) {
        await super.heescheel(olam);
        this.on("accepted interaction", (p) => {
            const wheat = p.inventory.slots.find(s => s && s.className === 'Wheat');
            if (wheat) {
                p.inventory.consumeItem(wheat, 1);
                p.inventory.addItem({ id: "fine_flour", className: "Brick", name: "Holy Flour", description: "Ready for baking." });
                this.playChaweeyoos("grind", { loop: false });
                this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Wheat Ground!", color: "#fff" });
            } else {
                this.ayshPeula("close dialogue", "Bring me some ripe wheat first!");
            }
        });
    }
}