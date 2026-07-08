// B"H
/**
 * @file ProceduralFlowerPatch.js
 * @module ProceduralFlowerPatch
 */

import Tzomayach from "../../chayim/tzomayach.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { FLOWER_VERTEX_SHADER, FLOWER_FRAGMENT_SHADER, getFlowerUniforms } from '../../shaders/FlowerShader.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import AwtsmoosThreeManifestor from "../../utils/3d/procedural/AwtsmoosThreeManifestor.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class ProceduralFlowerPatch extends Tzomayach {
    type = "ProceduralFlowerPatch";

    constructor(op, olam) {
        super(op, olam);
        this.count = op.count || 100;
        this.radius = op.radius || 10;
        this.flowerType = op.flowerType || 'rose';
    }

    async heescheel(olam) {
        this.olam = olam;
        
        try {
            // B"H: The Pure JSON Blueprint (Seder Hishtalshelus)
            const flowerBlueprint = {
                geometry: {
                    type: "PlaneGeometry",
                    args: [0.3, 0.3, 2, 2],
                    modifiers: [
                        {
                            type: "curveVertices",
                            axis: "z",
                            factor: 0.5,
                            dependency: "y" // curve petal backwards
                        },
                        { type: "computeVertexNormals" }
                    ]
                },
                material: {
                    type: "ShaderMaterial",
                    args: {
                        vertexShader: FLOWER_VERTEX_SHADER,
                        fragmentShader: FLOWER_FRAGMENT_SHADER,
                        uniforms: getFlowerUniforms(this.flowerType),
                        side: "DoubleSide",
                        transparent: true,
                        depthWrite: false
                    }
                },
                instanced: {
                    count: this.count,
                    distribution: {
                        type: "radial",
                        radius: this.radius,
                        yOffset: 0.15,
                        scaleRange: [0.5, 1.0],
                        rotationRange: [0, Math.PI]
                    }
                },
                name: `ProceduralFlowerPatch_${this.flowerType}_${this.id}`,
                frustumCulled: false
            };

            // Emanate the physical vessel purely from the JSON intent
            this.mesh = AwtsmoosThreeManifestor.emanate(flowerBlueprint);

            if (this.position) {
                this.mesh.position.copy(this.position.vector3 ? this.position.vector3() : this.position);
            }

            this.mesh.updateMatrixWorld(true);

            await olam.hoyseef(this);
            
            this.isReady = true;
            this.ayshPeula("heescheel", this);
            
        } catch (e) {
            console.error("B\"H - Critical Failure in Flower Patch Emanation. The light was too strong.", e);
            // Fallback: don't crash, just remain an invisible spiritual entity
            this.isReady = true;
        }
    }
}
