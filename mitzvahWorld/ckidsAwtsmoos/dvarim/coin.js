
/**
 * B"H
 * @file coin.js
 * A coin / Perutah.
 */

import Tzomayach from "../chayim/tzomayach.js";
import { CurrencySystem } from "./currencySystem.js";

// Exporting it here ensures backward compatibility if other files import from coin.js
export { CurrencySystem };

export default class Coin extends Tzomayach {
    rotationSpeed = 0.01;
    type = "coin";
    static itemName = "Perutah";
    static description = "A small copper coin. Value: 1 Perutah.";
    static icon = CurrencySystem.getBase64Icon(1);
    static stackSize = 1024;
    
    value = 1; 

    constructor(op) {
        var isBeingCollected = false;
        
        const coinValue = op.value || 1;
        let color = "brown";
        if (coinValue >= CurrencySystem.VALUES.DINAR) color = "silver";
        if (coinValue >= CurrencySystem.VALUES.SELA) color = "gold";

        op.golem = {
            guf: { 
                CylinderGeometry: [0.4, 0.4, 0.1, 12, 1]
            },
            toyr: {
                MeshLambertMaterial: { color: color, emissive: color, emissiveIntensity: 0.3 }
            }
        };
       
        super(op);
        this.value = coinValue;
        this.proximity = 0.5;

        if(op.rotationSpeed)
            this.rotationSpeed = op.rotationSpeed;

        this.heesHawveh = true;
        this.on("heesHawvoos", me => {
            if(!isBeingCollected) {
                me.mesh.rotation.y += this.rotationSpeed;
            } else {
                me.mesh.scale.x -= 0.05;
                me.mesh.scale.y -= 0.05;
                me.mesh.scale.z -= 0.05;
                if(me.mesh.scale.x < 0) {
                    var r = me.olam.sealayk(me);
                }
            }
        });

        this.on("ready", me => {
            this.mesh.rotation.z = 90 * Math.PI / 180;
        });

        this.on("nivraNeechnas", nivra => {
            if(!isBeingCollected && nivra.type === 'chossid') {
                isBeingCollected = true;
                this.ayshPeula("collected", this, nivra);
                if(nivra.inventory) {
                    nivra.inventory.addItem({
                        id: "coin_" + this.value,
                        className: "Coin",
                        name: CurrencySystem.NAMES[this.value] || "Currency",
                        value: this.value,
                        description: `Value: ${this.value} Perutahs`,
                        icon: CurrencySystem.getBase64Icon(this.value)
                    });
                }
            }
        });

        this.placeholderName="coin";
        
        this.on("collected", (n) =>{
            n.playSound("awtsmoos://dingSound", {
                layerName: "audio effects layer 1",
                loop: false
            });
        })
    }
}
