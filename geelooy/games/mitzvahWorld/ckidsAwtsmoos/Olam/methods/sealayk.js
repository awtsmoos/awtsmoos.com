/**
 * B"H
 * method to remove nivra from olam. Chapter 453: when a being leaves the
 * visible world, the Awtsmoos also lifts its footprint from the moving map.
 */
import { untrackDynamicNivra } from "../../../systems/spatial/DynamicSpatialWorld.js?compact=true&v=dynamic-spatial-world-20260617-bh1";

export default class {
    /**
     * @method sealayk removes a nivra from the olam if it exists in it.
     * @param {AWTSMOOS.Nivra} nivra
     */
    sealayk(nivra) {
        if(!nivra || nivra.__awtsmoosSealayking) return;
        try { untrackDynamicNivra(this, nivra); } catch(e) { console.error("B\"H - Dynamic spatial untrack failed:", e); }
        nivra.__awtsmoosSealayking = true;
        nivra.wasSealayked = true;
        try {
            this.htmlAction({
                shaym: "approach npc msg",
                methods: { classList: { add: "hidden" } }
            });
        } catch(e) { console.error("B\"H - Error caught:", e); }
        if(nivra.isMesh) {
            try {
                if(nivra.isSolid) this.worldOctree.removeMesh(nivra);
                if(nivra.isInteractive) this.interactiveOctree.removeMesh(nivra);
                nivra.removeFromParent();
            } catch(e) {}
        }
        const m = nivra.mesh;
        try {
            if(m) m.removeFromParent();
            if(nivra.modelMesh) nivra.modelMesh.removeFromParent();
        } catch(e) {}
        if (nivra.addedToPlaceholder) nivra.addedToPlaceholder.addedTo = null;
        if(nivra.isSolid) {
            try {
                if(nivra.mesh) {
                    this.worldOctree.removeMesh(nivra.mesh);
                    if(nivra.isInteractive) this.interactiveOctree.removeMesh(nivra.mesh);
                }
            } catch(e) {}
        }
        let ind = this.nivrayimWithPlaceholders.indexOf(nivra);
        if(ind > -1) this.nivrayimWithPlaceholders.splice(ind, 1);
        ind = this.interactableNivrayim.indexOf(nivra);
        if(ind > -1) this.interactableNivrayim.splice(ind, 1);
        ind = this.nivrayim.indexOf(nivra);
        if(ind > -1) { this.nivrayim.splice(ind, 1); nivra.clearAll(); }
    }
}
