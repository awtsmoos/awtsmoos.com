// B"H
/**
 * @file DisappearingPlatform.js
 * @description
 * B"H ? A memory platform. It gives a learnable warning, then vanishes.
 * Good players memorize its timing; greedy players meet the spikes below.
 */
import SolidBlock from "../architecture/SolidBlock.js";

export default class DisappearingPlatform extends SolidBlock {
    type = "disappearingPlatform";
    static itemName = "Disappearing Platform";

    constructor(op = {}, olam) {
        super({ ...op, color: op.color || 0xffca28 }, olam);
        this.proximity = op.proximity || 2;
        this.interactable = true;
        this.warningMs = op.warningMs || 520;
        this.hiddenMs = op.hiddenMs || 1600;
        this._armed = false;
        this.heesHawveh = true;

        this.on("nivraNeechnas", nivra => {
            if (this._armed || nivra?.type !== "chossid") return;
            this._armed = true;
            this._warnThenDisappear();
        });
    }

    _warnThenDisappear() {
        if (this.mesh?.material?.emissive) this.mesh.material.emissive.setHex(0xffaa00);
        setTimeout(() => this._vanish(), this.warningMs);
    }

    _vanish() {
        if (!this.mesh) return;
        this.mesh.visible = false;
        this.mesh.userData.isSolid = false;
        if (this.olam?.worldOctree?.removeMesh) this.olam.worldOctree.removeMesh(this.mesh);
        setTimeout(() => this.olam?.sealayk?.(this), this.hiddenMs);
    }

    heesHawvoos(dt) {
        if (!this.mesh || !this._armed || !this.mesh.visible) return;
        this.mesh.rotation.y += dt * 4;
    }
}
