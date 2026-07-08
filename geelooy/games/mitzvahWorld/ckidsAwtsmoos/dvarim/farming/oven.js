//B"H
import Domem from "../../chayim/domem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default class Oven extends Domem {
    async heescheel(olam) {
        await super.heescheel(olam);
        this.on("accepted interaction", (p) => {
            const flour = p.inventory.slots.find(s => s && s.id === "flour");
            if(flour) { p.inventory.consumeItem(flour, 1); p.inventory.addItem({ id: "challah", className: "Brick", name: "Challah" }); }
        });
    }
}