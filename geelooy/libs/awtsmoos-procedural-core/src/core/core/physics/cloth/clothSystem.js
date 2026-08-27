
// B"H
import { ClothObject } from './clothObject.js';
import { Vec3 } from '../../math/vec3.js';
import { performClothStep } from './stepper.js';

export class ClothSystem {
    objects = [];
    gravity = [0, -9.8, 0];
    staticColliders = [];
    
    wind = [0, 0, 0]; 
    gustVector = [0, 0, 0];
    gustDuration = 0;
    time = 0;

    constructor() {
        console.log('B"H - ClothSystem: Physics engine online.');
    }

    addClothObject(renderObj, config) {
        const cloth = new ClothObject(renderObj.id, renderObj, config);
        this.objects.push(cloth);
    }
    
    setStaticColliders(colliders) {
        this.staticColliders = colliders || [];
    }

    setWind(windVector) {
        const WIND_SCALE = 30.0; 
        if (windVector && Array.isArray(windVector)) {
            this.wind = Vec3.scale(windVector, WIND_SCALE);
        } else {
            this.wind = [0, 0, 0]; 
        }
    }

    applyGust(vector, duration) {
        this.gustVector = vector;
        this.gustDuration = duration; 
    }

    update(dt) {
        if (this.objects.length === 0) return;
        this.time += dt;

        if (this.gustDuration > 0) {
            this.gustDuration -= dt;
        }

        let frameDt = Math.min(dt, 0.05); 
        const stepSize = 0.01; 
        let numSteps = Math.floor(frameDt / stepSize);
        numSteps = Math.min(numSteps, 5); 

        for (let i = 0; i < numSteps; i++) {
            performClothStep(this, stepSize);
        }

        this.objects.forEach(cloth => cloth.updateNormals());
    }
}
