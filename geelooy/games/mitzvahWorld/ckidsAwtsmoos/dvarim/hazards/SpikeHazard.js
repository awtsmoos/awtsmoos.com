// B"H
/**
 * @file SpikeHazard.js
 * @description
 * B"H — A small honest thorn of judgment. It is data-spawnable, cheap, and
 * intentionally simple: the first version of the Ladder uses it as the reset
 * law. Touching it asks the Olam to show a warning and reloads the current
 * chamber so every Perutah returns to its authored place.
 */
import Tzomayach from "../../chayim/tzomayach.js";

export default class SpikeHazard extends Tzomayach {
    type = "spikeHazard";
    static itemName = "Spike Hazard";
    static description = "A verdict thorn. Touching it restarts the chamber and resets Perutos.";

    constructor(op = {}, olam) {
        op.interactable = true;
        op.proximity = op.proximity || 1.4;
        op.golem = op.golem || {
            guf: { ConeGeometry: [op.radius || 0.85, op.height || 1.65, 4] },
            toyr: { MeshLambertMaterial: { color: op.color || 0xcc1133, emissive: 0x550000 } }
        };
        super(op, olam);
        this.resetDelayMs = op.resetDelayMs || 550;
        this.penalty = op.penalty || 5;
        this._triggered = false;
        this.heesHawveh = true;

        this.on("ready", () => {
            if (!this.mesh) return;
            this.mesh.rotation.y = Math.PI / 4;
            this.mesh.userData.isSolid = false;
        });

        this.on("nivraNeechnas", nivra => {
            if (this._triggered || nivra?.type !== "chossid") return;
            this._triggered = true;
            const key = "awtsmoosMitzvahGlobalCoins";
            const oldValue = Number(globalThis.localStorage?.getItem(key) || 0);
            const lost = Math.min(oldValue, this.penalty);
            const nextValue = Math.max(0, oldValue - lost);
            globalThis.localStorage?.setItem(key, String(nextValue));
            this.olam?.ayshPeula?.("ui event", "effectsOverlay", {
                text: `OUCH! Lost ${lost} global coins. Perutos reset.`,
                color: "#ff2244"
            });
            setTimeout(() => {
                try {
                    globalThis.location?.reload?.();
                } catch (_e) {
                    if (nivra?.mesh) nivra.mesh.position.set(0, 8, 0);
                    this._triggered = false;
                }
            }, this.resetDelayMs);
        });
    }

    heesHawvoos() {
        this._awtsmoosCheckPlayerHit();
    }

    _awtsmoosCheckPlayerHit() {
        if (this._triggered || !this.mesh) return;
        const player = this.olam?.chossid;
        const p = player?.mesh?.position;
        if (!p) return;
        const dx = p.x - this.mesh.position.x;
        const dz = p.z - this.mesh.position.z;
        const dy = Math.abs(p.y - this.mesh.position.y);
        const radius = this.proximity || 1.5;
        if (Math.hypot(dx, dz) <= radius && dy < 4.5) {
            this._triggered = true;
            const key = "awtsmoosMitzvahGlobalCoins";
            const oldValue = Number(globalThis.localStorage?.getItem(key) || 0);
            const lost = Math.min(oldValue, this.penalty || 0);
            globalThis.localStorage?.setItem(key, String(Math.max(0, oldValue - lost)));
            this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "SPIKES! Resetting...", color: "#ff2244" });
            setTimeout(() => globalThis.location?.reload?.(), this.resetDelayMs || 250);
        }
    }
}
