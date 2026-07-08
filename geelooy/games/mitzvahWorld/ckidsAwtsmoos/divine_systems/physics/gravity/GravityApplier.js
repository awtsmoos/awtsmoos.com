
// B"H
import { GravityConstants } from "./GravityConstants.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * @class GravityApplier
 * @description
 * ⬇️ THE DESCENT OF FORCES ⬇️
 * 
 * Injects the negative Y vector into a body over time (dt).
 */
export default class GravityApplier {
    static apply(velocityVector, dt, isWorldBusy = false) {
        if (!isWorldBusy) {
            velocityVector.y -= GravityConstants.DEFAULT_PULL * dt;
        } else {
            // THE HOLY HOVER: Suspended animation while world builds
            velocityVector.y = 0;
        }
        
        // Cap at terminal velocity to prevent phasing through reality
        if (velocityVector.y < GravityConstants.TERMINAL_VELOCITY) {
            velocityVector.y = GravityConstants.TERMINAL_VELOCITY;
        }
    }
}
