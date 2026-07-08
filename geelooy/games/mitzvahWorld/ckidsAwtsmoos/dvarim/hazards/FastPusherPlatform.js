// B"H
/**
 * @file FastPusherPlatform.js
 * A striped orange launch plate. Touch it and the player is shoved brutally in
 * an authored direction, usually toward a spike field unless they jump early.
 */
import SolidBlock from "../architecture/SolidBlock.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class FastPusherPlatform extends SolidBlock {
    type = "fastPusherPlatform";
    static itemName = "Fast Pusher Platform";

    constructor(op = {}, olam) {
        super({ ...op, color: op.color || 0xff6d00 }, olam);
        this.proximity = op.proximity || 2.15;
        this.interactable = true;
        this.axis = op.axis || "z";
        this.direction = op.direction || 1;
        this.blastSpeed = op.blastSpeed || 30;
        this.cooldownMs = op.cooldownMs || 700;
        this._lastBlast = 0;

        this.on("nivraNeechnas", nivra => {
            if (nivra?.type !== "chossid" || !nivra.velocity) return;
            const now = performance.now();
            if (now - this._lastBlast < this.cooldownMs) return;
            this._lastBlast = now;
            if (this.axis === "x") nivra.velocity.x += this.direction * this.blastSpeed;
            else if (this.axis === "y") nivra.velocity.y += this.direction * this.blastSpeed;
            else nivra.velocity.z += this.direction * this.blastSpeed;
            this.olam?.ayshPeula?.("ui event", "effectsOverlay", {
                text: "SHOVE!",
                color: "#ff8a00"
            });
        });
    }
}
