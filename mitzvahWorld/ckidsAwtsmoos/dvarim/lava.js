
// B"H
import Domem from "../chayim/domem.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class Lava extends Domem {
    type = "lava";
    static itemName = "Bucket of Lava";
    static description = "A bubbling pool of molten earth. Careful!";
    static isBuildable = true;

    constructor(op, olam) {
        super(op, olam);
        this.heesHawveh = true;
        this.baseIntensity = op.intensity || 1.0;
        this.baseColor = op.color || "#ff4500";
        this.interactable = true; 
    }

    async heescheel(olam) {
        this.olam = olam;
        
        // B"H SAFE MODE: Standard Material
        const mat = new THREE.MeshStandardMaterial({
            color: this.baseColor,
            emissive: this.baseColor,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });

        const geo = new THREE.PlaneGeometry(5, 5, 2, 2); 
        
        this.mesh = new THREE.Mesh(geo, mat);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.userData.isSolid = false; 
        
        // Add a point light
        this.light = new THREE.PointLight(this.baseColor, this.baseIntensity * 2, 8);
        this.light.position.y = 1.0;
        this.mesh.add(this.light);

        if(this.position) this.mesh.position.copy(this.position.vector3());
        
        await olam.hoyseef(this);
        
        // Setup interaction
        this.on("accepted interaction", (player) => {
            this.openMenu();
        });

        this.isReady = true;
    }

    heesHawvoos(dt) {
        if(this.light) {
             // Simple flicker logic only
             this.light.intensity = this.baseIntensity * 2 + (Math.random() * 0.5);
        }
    }

    updateProperties(data) {
        if(data.color) {
            this.baseColor = data.color;
            if(this.mesh) this.mesh.material.color.set(data.color);
            if(this.mesh) this.mesh.material.emissive.set(data.color);
            if(this.light) this.light.color.set(data.color);
        }
        if(data.intensity !== undefined) {
            this.baseIntensity = parseFloat(data.intensity);
            if(this.light) this.light.intensity = this.baseIntensity * 2;
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
