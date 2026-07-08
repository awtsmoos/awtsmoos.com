// B"H
/**
 * @file ProceduralFurniture.js
 * @module ProceduralFurniture
 * @description THE VESSELS OF REST — Abstracted and Purified.
 */
import Tzomayach from "../../chayim/tzomayach.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { BARK_SNIPPETS } from "../../shaders/BarkShader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class ProceduralFurniture extends Tzomayach {
    type = "proceduralFurniture";
    static itemName = "Furniture";
    static isBuildable = true;

    constructor(op, olam) {
        super(op, olam);
        this.furnitureType = op.furnitureType || "chair"; // "chair", "table", "couch"
        this.interactable = true;
    }

    async heescheel(olam) {
        this.olam = olam;
        
        const geo = this.generateGeometry();
        
        // B"H: Use the Refined Bark Toyr (Material)
        this.mat = this.createMaterial('Lambert', {
            color: 0xffffff,
            side: 0 // FrontSide
        }, BARK_SNIPPETS);

        this.mesh = this.createMesh(geo, this.mat);
        this.mesh.name = this.furnitureType + "_" + this.id;
        this.mesh.nivraAwtsmoos = this;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        const p = this.position ? (typeof this.position.vector3 === 'function' ? this.position.vector3() : this.position) : {x:0, y:0, z:0};
        this.mesh.position.set(p.x, p.y || 0, p.z);
        if (this.rotation) this.mesh.rotation.set(this.rotation.x || 0, this.rotation.y || 0, this.rotation.z || 0);

        this.mesh.updateMatrixWorld(true);
        this.mesh.userData.isSolid = true;

        await olam.hoyseef(this);
        if(olam.worldOctree) olam.worldOctree.addObject(this.mesh);

        this.isReady = true;
        
        // Interaction
        this.on("accepted interaction", (chossid) => {
            if(this.furnitureType === "chair" || this.furnitureType === "couch") {
                this.olam.ayshPeula("ui event", "toast", { message: "B\"H - You sat down to rest and contemplate the Awtsmoos." });
            } else if (this.furnitureType === "table") {
                this.olam.ayshPeula("ui event", "toast", { message: "B\"H - A sturdy table for learning Torah." });
            }
        });
    }

    generateGeometry() {
        const parts = [];
        
        if (this.furnitureType === "table") {
            const top = this.createBoxGeometry(4, 0.2, 3);
            top.translate(0, 2, 0);
            parts.push(top);
            const positions = [[1.8, 1.8], [-1.8, 1.8], [1.8, -1.8], [-1.8, -1.8]];
            positions.forEach(p => {
                const leg = this.createBoxGeometry(0.2, 2, 0.2);
                leg.translate(p[0], 1, p[1]);
                parts.push(leg);
            });
        } 
        else if (this.furnitureType === "chair") {
            const seat = this.createBoxGeometry(1.2, 0.1, 1.2);
            seat.translate(0, 1, 0);
            parts.push(seat);
            const back = this.createBoxGeometry(1.2, 1.5, 0.1);
            back.translate(0, 1.8, -0.55);
            parts.push(back);
            const positions = [[0.5, 0.5], [-0.5, 0.5], [0.5, -0.5], [-0.5, -0.5]];
            positions.forEach(p => {
                const leg = this.createBoxGeometry(0.1, 1, 0.1);
                leg.translate(p[0], 0.5, p[1]);
                parts.push(leg);
            });
        }
        else if (this.furnitureType === "couch") {
            const seat = this.createBoxGeometry(4, 0.6, 1.5);
            seat.translate(0, 0.5, 0);
            parts.push(seat);
            const back = this.createBoxGeometry(4, 1.5, 0.4);
            back.translate(0, 1.2, -0.75);
            parts.push(back);
            const armL = this.createBoxGeometry(0.4, 1, 1.5);
            armL.translate(-2, 0.8, 0);
            parts.push(armL);
            const armR = this.createBoxGeometry(0.4, 1, 1.5);
            armR.translate(2, 0.8, 0);
            parts.push(armR);
        }

        if (parts.length > 0) {
            return this.mergeGeometries(parts, false);
        }
        return this.createBoxGeometry(1,1,1);
    }

    createBoxGeometry(w, h, d) {
        return this.olam.createBoxGeometry ? this.olam.createBoxGeometry(w, h, d) : null;
    }
}
