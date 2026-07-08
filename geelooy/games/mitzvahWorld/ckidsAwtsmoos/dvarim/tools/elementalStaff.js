
// B"H
import Tool from "../tool.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class ElementalStaff extends Tool {
    static itemName = "Staff of Elements";
    static description = "Cycle elements (Press F to fire). Shift+Click to change mode.";
    
    constructor(op, olam) {
        super(op, olam);
        this.modes = ['fire', 'water', 'air', 'earth'];
        this.currentMode = 0;
        
        // Custom Golem
        if (!op.golem) {
             this.golem = {
                 guf: { CylinderGeometry: [0.05, 0.05, 1.8] },
                 toyr: { MeshStandardMaterial: { color: "gold", roughness: 0.2 } },
                 modifiers: [
                     { type: "radial", count: 4, radius: 0.1, offset: {x:0, y:0.9, z:0} } // Orbs at top
                 ]
             };
        }
    }
    
    shoot() {
        if (this.op && this.op.customData && this.op.customData.modeIndex !== undefined) {
             this.currentMode = this.op.customData.modeIndex;
        }
        
        const mode = this.modes[this.currentMode];
        const player = this.olam.player || this.olam.chossid;
        if (!player) return;
        
        // Visual Feedback
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: `Cast: ${mode.toUpperCase()}`, color: this.getModeColor(mode) });
        
        // Projectile
        player.throwBall(null, { element: mode, damage: 15, isAttack: true });
    }
    
    // Toggle Mode
    altAction() {
        this.currentMode = (this.currentMode + 1) % this.modes.length;
        const mode = this.modes[this.currentMode];
        this.olam.ayshPeula("ui event", "effectsOverlay", { text: `Mode: ${mode.toUpperCase()}`, color: this.getModeColor(mode) });
    }
    
    getModeColor(mode) {
        switch(mode) {
            case 'fire': return '#ff4500';
            case 'water': return '#00aaff';
            case 'air': return '#ccffff';
            case 'earth': return '#8b4513';
            default: return '#ffffff';
        }
    }
}
