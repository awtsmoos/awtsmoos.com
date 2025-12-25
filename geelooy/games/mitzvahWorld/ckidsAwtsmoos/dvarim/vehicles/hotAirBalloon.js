//B"H
import Chai from "../../chayim/chai/index.js";
export default class HotAirBalloon extends Chai {
    heesHawvoos(dt) {
        if(this.driver) {
            if(this.olam.inputs.JUMP) this.velocity.y += 5 * dt;
            else this.velocity.y -= 2 * dt;
            this.mesh.position.y += this.velocity.y;
            this.driver.setPosition(this.mesh.position);
        }
    }
}