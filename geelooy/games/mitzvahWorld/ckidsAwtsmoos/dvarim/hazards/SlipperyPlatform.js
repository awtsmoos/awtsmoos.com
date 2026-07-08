// B"H
/**
 * @file SlipperyPlatform.js
 * A slick blue memory platform. When the player touches it, it keeps feeding
 * their current direction for a short time, so over-correction becomes danger.
 */
import SolidBlock from "../architecture/SolidBlock.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class SlipperyPlatform extends SolidBlock {
    type = "slipperyPlatform";
    static itemName = "Slippery Platform";

    constructor(op = {}, olam) {
        super({ ...op, color: op.color || 0x58d7ff }, olam);
        this.proximity = op.proximity || 2.0;
        this.interactable = true;
        this.slidePower = op.slidePower || 6.5;
        this.slideMs = op.slideMs || 900;
        this.axis = op.axis || null;
        this._sliding = new Map();
        this.heesHawveh = true;

        this.on("nivraNeechnas", nivra => {
            if (nivra?.type !== "chossid") return;
            const now = performance.now();
            const direction = this._directionFor(nivra);
            this._sliding.set(nivra, { until: now + this.slideMs, direction });
            this.olam?.ayshPeula?.("ui event", "effectsOverlay", {
                text: "SLIPPERY!",
                color: "#7ee7ff"
            });
        });
    }

    _directionFor(nivra) {
        const v = nivra?.velocity;
        if (this.axis === "x") return { x: Math.sign(v?.x || 1), z: 0 };
        if (this.axis === "z") return { x: 0, z: Math.sign(v?.z || 1) };
        const x = Math.abs(v?.x || 0) >= Math.abs(v?.z || 0) ? Math.sign(v?.x || 1) : 0;
        const z = x === 0 ? Math.sign(v?.z || 1) : 0;
        return { x, z };
    }

    heesHawvoos(dt) {
        const now = performance.now();
        for (const [nivra, state] of this._sliding) {
            if (!nivra?.velocity || now > state.until) {
                this._sliding.delete(nivra);
                continue;
            }
            nivra.velocity.x += state.direction.x * this.slidePower * dt;
            nivra.velocity.z += state.direction.z * this.slidePower * dt;
        }
        if (this.mesh) this.mesh.rotation.y += dt * 0.35;
    }
}
