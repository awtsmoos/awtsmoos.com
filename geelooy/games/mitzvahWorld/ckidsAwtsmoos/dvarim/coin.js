// B"H
/**
 * @file coin.js
 * A Perutah / optional global coin reward.
 */
import Tzomayach from "../chayim/tzomayach.js";
import { CurrencySystem } from "./currencySystem.js";

export { CurrencySystem };

export default class Coin extends Tzomayach {
    rotationSpeed = 0.01;
    type = "coin";
    static itemName = "Perutah";
    static description = "A small copper coin. Value: 1 Perutah.";
    static icon = CurrencySystem.getBase64Icon(1);
    static stackSize = 1024;

    value = 1;
    globalValue = 0;

    constructor(op = {}) {
        let isBeingCollected = false;
        const coinValue = op.value || 1;
        let color = "brown";
        if (coinValue >= CurrencySystem.VALUES.DINAR) color = "silver";
        if (coinValue >= CurrencySystem.VALUES.SELA) color = "gold";

        op.golem = {
            guf: { CylinderGeometry: [0.4, 0.4, 0.1, 12, 1] },
            toyr: { MeshLambertMaterial: { color, emissive: color, emissiveIntensity: 0.3 } }
        };

        super(op);
        this.value = coinValue;
        this.globalValue = op.globalValue || 0;
        this.proximity = 0.5;
        this.rotationSpeed = op.rotationSpeed || this.rotationSpeed;
        this.heesHawveh = true;

        this.on("heesHawvoos", me => {
            if (!isBeingCollected) {
                me.mesh.rotation.y += this.rotationSpeed;
                return;
            }
            me.mesh.scale.x -= 0.05;
            me.mesh.scale.y -= 0.05;
            me.mesh.scale.z -= 0.05;
            if (me.mesh.scale.x < 0) me.olam.sealayk(me);
        });

        this.on("ready", () => {
            if (this.mesh) this.mesh.rotation.z = Math.PI / 2;
        });

        this.on("nivraNeechnas", nivra => {
            if (isBeingCollected || nivra.type !== "chossid") return;
            isBeingCollected = true;
            this.ayshPeula("collected", this, nivra);

            if (nivra.inventory) {
                nivra.inventory.addItem({
                    id: "coin_" + this.value,
                    className: "Coin",
                    name: CurrencySystem.NAMES[this.value] || "Currency",
                    value: this.value,
                    description: `Value: ${this.value} Perutahs`,
                    icon: CurrencySystem.getBase64Icon(this.value)
                });
            }

            const levelKey = this.olam?.sourcePath || "current";
            const progressKey = `awtsmoosPerutos:${levelKey}`;
            const oldPerutos = Number(globalThis.sessionStorage?.getItem(progressKey) || 0);
            const nextPerutos = oldPerutos + this.value;
            globalThis.sessionStorage?.setItem(progressKey, String(nextPerutos));

            let globalCoins = Number(globalThis.localStorage?.getItem("awtsmoosMitzvahGlobalCoins") || 0);
            if (this.globalValue > 0) {
                globalCoins += this.globalValue;
                globalThis.localStorage?.setItem("awtsmoosMitzvahGlobalCoins", String(globalCoins));
            }

            this.olam?.ayshPeula?.("ui event", "perutahProgress", {
                levelKey,
                collected: nextPerutos,
                added: this.value,
                globalCoins,
                globalAdded: this.globalValue
            });
        });

        this.placeholderName = "coin";
        this.on("collected", n => {
            n.playSound("awtsmoos://dingSound", {
                layerName: "audio effects layer 1",
                loop: false
            });
        });
    }
}
