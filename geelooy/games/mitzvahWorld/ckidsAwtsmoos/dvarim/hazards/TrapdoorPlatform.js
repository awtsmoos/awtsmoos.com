// B"H
/**
 * @file TrapdoorPlatform.js
 * @description
 * B"H ? A floor that opens like a verdict. The visual platform tilts away,
 * removes solidity, and leaves the authored spike pit below to explain itself.
 */
import SolidBlock from "../architecture/SolidBlock.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class TrapdoorPlatform extends SolidBlock {
    type = "trapdoorPlatform";
    static itemName = "Trapdoor Platform";

    constructor(op = {}, olam) {
        super({ ...op, color: op.color || 0x6d4c41 }, olam);
        this.proximity = op.proximity || 2;
        this.interactable = true;
        this.delayMs = op.delayMs || 650;
        this.openSpeed = op.openSpeed || 4.5;
        this._armed = false;
        this._opening = false;
        this.heesHawveh = true;

        this.on("nivraNeechnas", nivra => {
            if (this._armed || nivra?.type !== "chossid") return;
            this._armed = true;
            if (this.mesh?.material?.emissive) this.mesh.material.emissive.setHex(0x552200);
            setTimeout(() => this._open(), this.delayMs);
        });
    }

    _open() {
        this._opening = true;
        if (this.mesh) this.mesh.userData.isSolid = false;
        if (this.mesh && this.olam?.worldOctree?.removeMesh) this.olam.worldOctree.removeMesh(this.mesh);
    }

    heesHawvoos(dt) {
        if (!this.mesh || !this._opening) return;
        this.mesh.rotation.z = Math.min(Math.PI / 2, this.mesh.rotation.z + this.openSpeed * dt);
    }
}
