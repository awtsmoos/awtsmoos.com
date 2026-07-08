//B"H
import Chai from "../../chayim/chai/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default class MagicalChariot extends Chai {
    heesHawvoos(dt) {
        if(this.driver) {
            if(this.olam.inputs.FORWARD) this.speed = 40; else this.speed = 0;
            if(this.olam.inputs.JUMP) this.mesh.position.y += 10 * dt;
            const f = new THREE.Vector3(0,0,1).applyQuaternion(this.mesh.quaternion);
            this.mesh.position.add(f.multiplyScalar(this.speed * dt));
            this.driver.setPosition(this.mesh.position);
            if(this.mesh.position.y > 100) this.olam.ayshPeula("ui event", "effectsOverlay", { text: "Entering Spiritual Realm", color: "purple" });
        }
    }
}