/**
 * B"H
 * environment related listeners
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default function() {
    var self = this;
    
    this.on("start rain", d => {
        if(this.environment && this.environment.startRain) {
             this.environment.startRain();
        }
    });

    this.on("stop rain", d => {
        if(this.environment && this.environment.stopRain) {
             this.environment.stopRain();
        }
    });

    var _rainCycle = null;
    this.on("start rain cycle", seconds => {
        if(!seconds) seconds = 15

        function rainCycle() {
            if(!self.environment) return;
            
            // Check weatherType property on the new Environment class
            if(self.environment.weatherType === 'RAIN' || self.environment.weatherType === 'STORM') {
                self.ayshPeula("stop rain");
            } else {
                self.ayshPeula("start rain");
            }
                
            _rainCycle = setTimeout(
                rainCycle,
                seconds * 1000
            )
        }

        rainCycle();
    });

    this.on("stop rain cycle", () => {
        this.ayshPeula("stop rain");
        if(_rainCycle) {
            clearTimeout(_rainCycle);
        }
    });

    // Sun and Sky placeholders (handled by Environment class logic now)
    this.on("start sky", () => {
         // The new Environment class handles background/fog automatically
         // We can leave this hook if other systems trigger it
    });

    this.on("update sun", () => {
         // Handled by Environment.update
    });

    // Simple Water Setup
    this.on("start water", async mesh => {
        try {
           const waterMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(0x00aaff),
                transparent: true,
                opacity: 0.6,
                side: THREE.DoubleSide
           });
           mesh.material = waterMaterial;
           mesh.material.needsUpdate = true;
           this.mayim = this.mayim || [];
           this.mayim.push(mesh);
        } catch(e) {
            console.error("Issue with water setup", e);
        }
    });
}