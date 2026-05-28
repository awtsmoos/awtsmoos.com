// B"H
/**
 * @file CoinMimicHazard.js
 * @description
 * B"H — A Perutah-looking lie. It spins like reward, shines like reward,
 * and then reveals itself as judgment. Levels can mix true optional coins
 * with these to create hilarious paranoia.
 */
import SpikeHazard from "./SpikeHazard.js";

export default class CoinMimicHazard extends SpikeHazard {
    type = "coinMimicHazard";
    static itemName = "Coin Mimic";

    constructor(op = {}, olam) {
        op.radius = op.radius || 0.42;
        op.height = op.height || 0.16;
        op.proximity = op.proximity || 0.75;
        op.penalty = op.penalty || 7;
        op.golem = op.golem || {
            guf: { CylinderGeometry: [0.42, 0.42, 0.12, 14, 1] },
            toyr: { MeshLambertMaterial: { color: "gold", emissive: "gold", emissiveIntensity: 0.55 } }
        };
        super(op, olam);
        this.rotationSpeed = op.rotationSpeed || 0.05;
        this.heesHawveh = true;
    }

    heesHawvoos() {
        if (this.mesh) this.mesh.rotation.y += this.rotationSpeed;
    }
}
