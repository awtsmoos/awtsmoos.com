// B"H
/**
 * @file MovingPlatform.js
 * @description
 * B"H — A small moving solid platform for authored Ladder chambers. It moves
 * on a simple sine path around its birth position. The first implementation is
 * deliberately tiny and cheap; it updates matrix/world octree only by moving
 * the mesh, letting the existing collision system read the current transform.
 */
import SolidBlock from "../architecture/SolidBlock.js";

export default class MovingPlatform extends SolidBlock {
    type = "movingPlatform";
    static itemName = "Moving Platform";

    constructor(op = {}, olam) {
        super({ ...op, color: op.color || 0x42a5f5 }, olam);
        this.axis = op.axis || "x";
        this.distance = op.distance || 5;
        this.speed = op.moveSpeed || op.speed || 1;
        this.phase = op.phase || 0;
        this._home = null;
        this.heesHawveh = true;
    }

    async heescheel(olam) {
        await super.heescheel(olam);
        if (this.mesh) this._home = this.mesh.position.clone();
    }

    heesHawvoos(dt) {
        if (!this.mesh || !this._home) return;
        const offset = Math.sin(Date.now() * 0.001 * this.speed + this.phase) * this.distance;
        this.mesh.position.copy(this._home);
        if (this.axis === "y") this.mesh.position.y += offset;
        else if (this.axis === "z") this.mesh.position.z += offset;
        else this.mesh.position.x += offset;
        this.mesh.updateMatrixWorld(true);
    }
}
