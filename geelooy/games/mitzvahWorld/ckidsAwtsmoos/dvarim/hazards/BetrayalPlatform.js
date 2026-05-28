// B"H
/**
 * @file BetrayalPlatform.js
 * @description
 * B"H — A platform that speaks in hints before it betrays. It begins as a
 * normal solid block, then when the player steps near, it flickers and drops.
 * This is intentionally compact so authored levels can use it freely.
 */
import SolidBlock from "../architecture/SolidBlock.js";

export default class BetrayalPlatform extends SolidBlock {
    type = "betrayalPlatform";
    static itemName = "Betrayal Platform";

    constructor(op = {}, olam) {
        super({ ...op, color: op.color || 0x8866ff }, olam);
        this.proximity = op.proximity || 1.8;
        this.interactable = true;
        this.dropDelayMs = op.dropDelayMs || 420;
        this.fallSpeed = op.fallSpeed || 10;
        this._armed = false;
        this._falling = false;
        this.heesHawveh = true;

        this.on("nivraNeechnas", nivra => {
            if (this._armed || nivra?.type !== "chossid") return;
            this._armed = true;
            if (this.mesh?.material?.emissive) this.mesh.material.emissive.setHex(0x331144);
            setTimeout(() => {
                this._falling = true;
                if (this.mesh && this.olam?.worldOctree?.removeMesh) {
                    this.olam.worldOctree.removeMesh(this.mesh);
                    this.mesh.userData.isSolid = false;
                }
            }, this.dropDelayMs);
        });
    }

    heesHawvoos(dt) {
        if (!this._falling || !this.mesh) return;
        this.mesh.position.y -= this.fallSpeed * dt;
        this.mesh.rotation.z += dt * 2;
        if (this.mesh.position.y < -40) this.olam?.sealayk?.(this);
    }
}
