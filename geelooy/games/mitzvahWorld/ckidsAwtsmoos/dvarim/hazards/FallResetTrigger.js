// B"H
/**
 * @file FallResetTrigger.js
 * @description
 * B"H — A broad invisible/low red reset field under a platforming chamber.
 * If the player falls into the abyss, the level reloads instead of leaving
 * them trapped below the route. It is intentionally not solid and should not
 * enter the octree.
 */
import Tzomayach from "../../chayim/tzomayach.js";

export default class FallResetTrigger extends Tzomayach {
    type = "fallResetTrigger";
    static itemName = "Fall Reset Trigger";

    constructor(op = {}, olam) {
        op.interactable = true;
        op.proximity = op.proximity || 8;
        op.isSolid = false;
        op.golem = op.golem || {
            guf: { BoxGeometry: [op.width || 120, op.height || 0.4, op.depth || 90] },
            toyr: { MeshBasicMaterial: { color: op.color || 0x220000, transparent: true, opacity: op.opacity ?? 0.12 } }
        };
        super(op, olam);
        this.resetDelayMs = op.resetDelayMs || 120;
        this._triggered = false;
        this.heesHawveh = true;

        this.on("ready", () => {
            if (!this.mesh) return;
            this.mesh.userData.isSolid = false;
            this.mesh.userData.addToOctree = false;
        });

        this.on("nivraNeechnas", nivra => {
            if (this._triggered || nivra?.type !== "chossid") return;
            this._triggered = true;
            this.olam?.ayshPeula?.("ui event", "effectsOverlay", {
                text: "FELL INTO THE PIT! Resetting...",
                color: "#ffcc55"
            });
            setTimeout(() => globalThis.location?.reload?.(), this.resetDelayMs);
        });
    }

    heesHawvoos() {
        this._awtsmoosCheckFall();
    }

    _awtsmoosCheckFall() {
        if (this._triggered) return;
        const player = this.olam?.chossid;
        const y = player?.mesh?.position?.y;
        if (Number.isFinite(y) && y < (this.mesh?.position?.y || -10) + 3) {
            this._triggered = true;
            this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "FELL! Resetting...", color: "#ffcc55" });
            setTimeout(() => globalThis.location?.reload?.(), this.resetDelayMs || 120);
        }
    }
}
