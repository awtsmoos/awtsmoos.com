// B"H
/**
 * @file PusherPlatform.js
 * @description
 * B"H ? A malicious platform that suddenly lunges toward a spike lane. It is
 * a moving SolidBlock with a delayed burst, designed for panic-memory levels.
 */
import SolidBlock from "../architecture/SolidBlock.js";

export default class PusherPlatform extends SolidBlock {
    type = "pusherPlatform";
    static itemName = "Pusher Platform";

    constructor(op = {}, olam) {
        super({ ...op, color: op.color || 0xef5350 }, olam);
        this.proximity = op.proximity || 2.2;
        this.interactable = true;
        this.delayMs = op.delayMs || 450;
        this.axis = op.axis || "z";
        this.pushDistance = op.pushDistance || 8;
        this.pushSpeed = op.pushSpeed || 16;
        this._home = null;
        this._armed = false;
        this._pushing = false;
        this._pushed = 0;
        this.heesHawveh = true;

        this.on("nivraNeechnas", nivra => {
            if (this._armed || nivra?.type !== "chossid") return;
            this._armed = true;
            setTimeout(() => { this._pushing = true; }, this.delayMs);
        });
    }

    async heescheel(olam) {
        await super.heescheel(olam);
        if (this.mesh) this._home = this.mesh.position.clone();
    }

    heesHawvoos(dt) {
        if (!this.mesh || !this._pushing || this._pushed >= this.pushDistance) return;
        const step = Math.min(this.pushDistance - this._pushed, this.pushSpeed * dt);
        this._pushed += step;
        if (this.axis === "x") this.mesh.position.x += step;
        else if (this.axis === "y") this.mesh.position.y += step;
        else this.mesh.position.z += step;
        this.mesh.updateMatrixWorld(true);
    }
}
