//B"H
import Chai from "../../chayim/chai/index.js";
export default class Hoverboard extends Chai {
    heesHawvoos(dt) {
        if(this.driver) {
            this.mesh.position.y = 1.0 + Math.sin(Date.now()*0.005)*0.1;
            const f = new THREE.Vector3(0,0,1).applyQuaternion(this.mesh.quaternion);
            this.mesh.position.add(f.multiplyScalar(20 * dt));
            this.driver.setPosition(this.mesh.position);
        }
    }
}