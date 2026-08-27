// B"H
/**
 * @file metaballSystem.js
 * @brief Performance-optimized fluid manifestation. Balanced for splitting appearance.
 */
import { MarchingCubes } from '../geometry/marchingCubes.js';
import { updateScalarField } from './metaballs/field.js';

export class MetaballSystem {
    constructor() {
        this.metaballs = [];
        this.targetMesh = null;
        // B"H - 18^3 is the sweet spot for mobile performance vs fluid detail.
        this.gridResolution = 18; 
        this.gridSize = 850;       
        // B"H - ISO level tuned for splitting.
        this.isoLevel = 0.4;     
        this.gridValues = new Float32Array(this.gridResolution ** 3);
        this.marchingCubes = new MarchingCubes();
        this.baseColor = [0.0, 0.5, 1.0, 0.9]; 
        this.currentCenter = [0, 0, 0];
    }

    clear() {
        this.metaballs = [];
        this.targetMesh = null;
    }

    addMetaball(body) {
        this.metaballs.push(body);
    }

    setTargetMesh(renderObj) {
        this.targetMesh = renderObj;
        if (renderObj.shaderVars && renderObj.shaderVars.uBaseColor) {
            this.baseColor = [...renderObj.shaderVars.uBaseColor, 0.9];
        }
    }

    update(dt) {
        if (!this.targetMesh || this.metaballs.length === 0) return;

        let avgX = 0, avgY = 0, avgZ = 0;
        for (let i = 0; i < this.metaballs.length; i++) {
            const pos = this.metaballs[i].pos;
            avgX += pos[0]; avgY += pos[1]; avgZ += pos[2];
        }
        // Smooth center tracking to prevent grid jitter
        const targetX = avgX / this.metaballs.length;
        const targetY = avgY / this.metaballs.length;
        const targetZ = avgZ / this.metaballs.length;
        this.currentCenter[0] += (targetX - this.currentCenter[0]) * 0.2;
        this.currentCenter[1] += (targetY - this.currentCenter[1]) * 0.2;
        this.currentCenter[2] += (targetZ - this.currentCenter[2]) * 0.2;

        updateScalarField(this.gridValues, this.metaballs, this.gridResolution, this.gridSize, this.currentCenter);
        
        const result = this.marchingCubes.generateMesh(
            this.gridValues, 
            this.gridResolution, 
            this.gridSize, 
            this.isoLevel, 
            this.metaballs,
            this.currentCenter
        );
        
        this.targetMesh.positions = result.positions;
        this.targetMesh.normals = result.normals;
        this.targetMesh.indices = result.indices;

        const vertCount = result.positions.length / 3;
        if (!this.targetMesh.colors || this.targetMesh.colors.length !== vertCount * 4) {
            const colors = new Float32Array(vertCount * 4);
            const [r, g, b, a] = this.baseColor;
            for (let i = 0; i < vertCount; i++) {
                const i4 = i * 4;
                colors[i4] = r; colors[i4+1] = g; colors[i4+2] = b; colors[i4+3] = a;
            }
            this.targetMesh.colors = colors;
        }

        this.targetMesh.dirty = true;
    }
}