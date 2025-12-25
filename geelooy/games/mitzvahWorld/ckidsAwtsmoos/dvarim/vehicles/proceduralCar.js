//B"H
import Chai from "../../chayim/chai/index.js";
import * as THREE from '/games/scripts/build/three.module.js';

export default class ProceduralCar extends Chai {
    constructor(op, olam) { super(op, olam); this.speed = 0; this.maxSpeed = 30; this.isSolid = true; }
    async heescheel(olam) {
        await super.heescheel(olam);
        this.on("accepted interaction", (p) => { if(!this.driver) this.enter(p); });
    }
    enter(p) { this.driver = p; p.mesh.visible = false; this.olam.ayin.target = this; }
    heesHawvoos(dt) {
        if (this.driver) {
            if (this.olam.inputs.FORWARD) this.speed = Math.min(this.maxSpeed, this.speed + 10 * dt);
            else this.speed *= 0.95;
            const forward = new THREE.Vector3(0,0,1).applyQuaternion(this.mesh.quaternion);
            this.mesh.position.add(forward.multiplyScalar(this.speed * dt));
            if (this.olam.inputs.LEFT_ROTATE) this.mesh.rotation.y += 2 * dt;
            if (this.olam.inputs.RIGHT_ROTATE) this.mesh.rotation.y -= 2 * dt;
            this.driver.setPosition(this.mesh.position);
        }
    }
}