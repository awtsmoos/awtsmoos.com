//B"H
import Chai from "../../chayim/chai/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default class ProceduralBoat extends Chai {
    heesHawvoos(dt) {
        const waterY = this.olam.waterLevel || 0;
        this.mesh.position.y = waterY + Math.sin(Date.now()*0.002)*0.2;
        if(this.driver) {
            const f = new THREE.Vector3(0,0,1).applyQuaternion(this.mesh.quaternion);
            this.mesh.position.add(f.multiplyScalar(this.speed * dt));
            this.driver.setPosition(this.mesh.position);
        }
    }
}