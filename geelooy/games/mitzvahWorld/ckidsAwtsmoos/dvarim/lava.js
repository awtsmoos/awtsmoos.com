
// B"H
/**
 * B"H
 * @file lava.js
 * A procedural fire entity - SAFE MODE
 * 
 * THE TIKKUN OF PERFORMANCE:
 * PointLights eradicated. The magma now glows with intense emissive energy,
 * saving the rendering pipeline from infinite compilation loops.
 */
import Domem from "../chayim/domem/index.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class Lava extends Domem {
    type = "lava";
    static itemName = "Bucket of Lava";
    static description = "A bubbling pool of molten earth. Careful!";
    static isBuildable = true;

    constructor(op, olam) {
        super(op, olam);
        this.heesHawveh = true;
        this.baseIntensity = op.intensity || 2.0;
        this.baseColor = op.color || "#ff4500";
        this.interactable = true; 
    }

    async heescheel(olam) {
        this.olam = olam;
        
        // B"H SAFE MODE: Emissive Material instead of lights
        const mat = new THREE.MeshStandardMaterial({
            color: this.baseColor,
            emissive: this.baseColor,
            emissiveIntensity: this.baseIntensity * 2.0,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        const geo = new THREE.PlaneGeometry(5, 5, 2, 2); 
        
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.userData.isSolid = false; 
        
        if(this.position) this.mesh.position.copy(this.position.vector3());
        
        await olam.hoyseef(this);
        
        // Setup interaction
        this.on("accepted interaction", (player) => {
            this.openMenu();
        });

        this.isReady = true;
    }

    heesHawvoos(dt) {
        if(this.mesh && this.mesh.material) {
             // Simple emissive flicker logic
             this.mesh.material.emissiveIntensity = (this.baseIntensity * 2.0) + (Math.random() * 0.8);
        }
    }

    updateProperties(data) {
        if(data.color) {
            this.baseColor = data.color;
            if(this.mesh) {
                this.mesh.material.color.set(data.color);
                this.mesh.material.emissive.set(data.color);
            }
        }
        if(data.intensity !== undefined) {
            this.baseIntensity = parseFloat(data.intensity);
            if(this.mesh) this.mesh.material.emissiveIntensity = this.baseIntensity * 2.0;
        }
    }

    openMenu() {
        this.olam.ayshPeula("ui event", "lavaMenu", {
            open: {
                id: this.name, 
                color: this.baseColor,
                intensity: this.baseIntensity
            }
        });
        
        this.olam.htmlAction({
             shaym: "approach npc msg",
             methods: { classList: { add: "hidden" } }
        });
    }
}
