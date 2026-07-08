//B"H
import Tool from "../tool.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default class Telescope extends Tool {
    constructor(op, olam) { super(op); this.olam = olam; }
    async shoot() { 
        if (!this.olam || !this.olam.ayin || !this.olam.ayin.camera) return;
        const cam = this.olam.ayin.camera;
        if (cam.fov === 20) {
             cam.fov = 75; // Default FOV
        } else {
             cam.fov = 20;
        }
        cam.updateProjectionMatrix(); 
        
        if (typeof this.olam.playSound === 'function') {
            this.olam.playSound("awtsmoos://click", { volume: 0.5 });
        }
    }
}