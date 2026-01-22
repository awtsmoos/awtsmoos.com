/**
 * B"H
 * GrassMaterial - SAFE MODE
 */
import * as THREE from '/games/scripts/build/three.module.js';

export default class GrassMaterial extends THREE.MeshBasicMaterial {
    constructor(props = {}) {
        super({
            color: 0x44aa44,
            ...props
        });
        console.log("B\"H [GrassMaterial] Safe mode active.");
    }
}