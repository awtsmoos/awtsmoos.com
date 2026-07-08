//B"H
/**
 * Time Scepter - A holy staff that controls the passage of time in the Olam.
 */
import Tool from "../tool.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class TimeScepter extends Tool {
    static itemName = "Time Scepter";
    static description = "Manipulate the sun and moon. (Click to speed up time)";
    
    constructor(op) {
        if (!op.golem) {
            op.golem = {
                guf: { CylinderGeometry: [0.1, 0.05, 2] },
                toyr: { MeshStandardMaterial: { color: "gold", emissive: "gold", emissiveIntensity: 0.5 } }
            };
        }
        super(op);
    }

    async shoot() {
        if (this.olam.environment) {
            // Accelerate time drastically for a moment
            this.olam.environment.gameTime = (this.olam.environment.gameTime + 6) % 24;
            this.olam.ayshPeula("ui event", "effectsOverlay", { 
                text: "Time Dilation Activated", 
                color: "#FECB39" 
            });
            this.olam.playSound("awtsmoos://dingSound");
        }
    }
}