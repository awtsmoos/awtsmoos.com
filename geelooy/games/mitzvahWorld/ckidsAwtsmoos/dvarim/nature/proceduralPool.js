
//B"H
import Domem from "../../chayim/domem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class ProceduralPool extends Domem {
    constructor(op, olam) { super(op, olam); this.width = op.width || 5; this.depth = op.depth || 5; this.heesHawveh = true; }
    async heescheel(olam) {
        this.olam = olam; this.mesh = new THREE.Group();
        const water = new THREE.Mesh(new THREE.PlaneGeometry(this.width-0.4, this.depth-0.4), new THREE.MeshBasicMaterial({ color: 0x00aaff, transparent: true, opacity: 0.6 }));
        water.rotation.x = -Math.PI/2; water.position.y = 0.8; water.userData.isWater = true; this.mesh.add(water);
        const floor = new THREE.Mesh(new THREE.BoxGeometry(this.width, 0.2, this.depth), new THREE.MeshStandardMaterial({ color: 0x888888 }));
        this.mesh.add(floor);
        if(this.position) this.mesh.position.copy(this.position.vector3());
        await olam.hoyseef(this); this.isReady = true;
    }
}
