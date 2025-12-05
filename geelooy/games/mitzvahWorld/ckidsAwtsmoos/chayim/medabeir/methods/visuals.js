
/**
 * B"H
 * @file visuals.js
 * Visual representation logic: Garments, Body Parts (Goof), and Mood.
 */

export default {
    garmentsDefault: {
        glasses: true,
        jacket: true,
        "top-hat": false,
    },

    wear(garmentName) {
        if(!this.garments) return;
        var gar = this?.garments?.[garmentName];
        if(gar) gar.visible = true;
    },
    
    takeoff(garmentName) {
        if(!this.garments) return;
        var gar = this?.garments?.[garmentName];
        if(gar) gar.visible = false;
    },

    initializeEyelid(ref) { 
        // Placeholder for specific facial animations
    },

    setupGoof() {
        if(this.goofParts && this.mesh) {
            this.goof = {}
            Object.keys(this.goofParts).forEach(q => {
                this.mesh.traverse(child => {
                    if(child.isMesh && child.name == q) {
                        this.goof[this.goofParts[q]] = child;
                    }
                })
            });
            // Cleanup raw options after parsing
            delete this.goofOptions;
            delete this.goofParts;
        }
    }
};
