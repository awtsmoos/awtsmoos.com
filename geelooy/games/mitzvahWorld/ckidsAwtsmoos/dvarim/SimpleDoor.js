// B"H
import Tzomayach from "../chayim/tzomayach.js";

/**
 * Tiny platformer door with no GeometryManager / procedural-house imports.
 */
export default class SimpleDoor extends Tzomayach {
    type = "interactiveDoor";
    static itemName = "Door";

    constructor(op = {}, olam) {
        op.interactable = true;
        op.proximity = op.proximity || 3.2;
        op.isSolid = false;
        op.golem = op.golem || {
            guf: { BoxGeometry: [1.4, 2.8, 0.35] },
            toyr: { MeshLambertMaterial: { color: op.color || 0x7b3f1d, emissive: 0x221000 } }
        };
        super(op, olam);
        this.next = op.next || op.target || null;
        this.label = op.label || op.name || "Gate";

        this.on("nivraNeechnas", nivra => {
            if (nivra?.type !== "chossid") return;
            this.olam?.ayshPeula?.("ui event", "effectsOverlay", {
                text: this.label,
                color: "#ffd166"
            });
        });

        this.on("accepted interaction", () => {
            if (!this.next) return;
            const url = new URL(globalThis.location.href);
            url.searchParams.set("path", this.next);
            globalThis.location.href = url.toString();
        });
    }
}
