/**
 * B"H
 * method to remove nivra from olam
 * 
 */

export default class {
    /**
     * @method sealayk removes a nivra from 
     * the olam if it exists in it
     * @param {AWTSMOOS.Nivra} nivra 
     */

    sealayk(nivra) {
        if(!nivra) return;
        /**
         * keep track of if it was removed
         */
        nivra.wasSealayked = true;
        
        // B"H: Force hide the approach prompt (Press B...) when deleting objects
        try {
            this.htmlAction({
                shaym: "approach npc msg",
                methods: { classList: { add: "hidden" } }
            });
        } catch(e) { console.error("B\"H - Error caught:", e); }

        // B"H: Trigger sealayk event BEFORE destroying everything so listeners can clean up.
        try {
            if(nivra && nivra.ayshPeula) {
		        nivra.ayshPeula("sealayk"); 
            }
        } catch(e) { console.error("B\"H - Error caught:", e); }

        if(nivra.isMesh) {
            try {
                if(nivra.isSolid) {
                    this.worldOctree.removeMesh(nivra)
                }
                if(nivra.isInteractive) {
                    this.interactiveOctree.removeMesh(nivra);
                }
                nivra.removeFromParent();
            } catch(e) {

            }
        }
     
        var m = nivra.mesh;
        try {
            if(m) {
                m.removeFromParent();
            }
            if(nivra.modelMesh) {
                nivra.modelMesh.removeFromParent();
            }
        } catch(e){
            // B"H: silent
        }

        if (nivra.addedToPlaceholder) {
            nivra.addedToPlaceholder.addedTo = null;
        }
        
        if(nivra.isSolid) {
            try {
                if(nivra.mesh) {
                    this.worldOctree.removeMesh(nivra.mesh);
                    if(nivra.isInteractive) {
                        this.interactiveOctree.removeMesh(nivra.mesh);
                    }
                }
            } catch(e){
                // B"H: silent
            }
        }

        var ind = this.nivrayimWithPlaceholders.indexOf(nivra);
        if(ind > -1) {
            this.nivrayimWithPlaceholders.splice(ind, 1);
        }

        ind = this.interactableNivrayim.indexOf(nivra);
        if(ind > -1) {
            this.interactableNivrayim.splice(ind, 1);
        }

        ind = this.nivrayim.indexOf(nivra)
        if(ind > -1) {
            this.nivrayim.splice(ind, 1);
            nivra.clearAll();
        } else {
          // B"H: silent
        }
    }
}