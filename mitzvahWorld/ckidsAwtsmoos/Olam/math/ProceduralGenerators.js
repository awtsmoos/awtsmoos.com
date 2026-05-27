
//B"H
/**
 * ProceduralGenerators - The Chochmah of form.
 */
import * as THREE from '/games/scripts/build/three.module.js';
import * as BufferGeometryUtils from '/games/scripts/jsm/utils/BufferGeometryUtils.js';

export default class ProceduralGenerators {
    static gematriaMap = {'א':1,'ב':2,'ג':3,'ד':4,'ה':5,'ו':6,'ז':7,'ח':8,'ט':9,'י':10,'כ':20,'ל':30,'מ':40,'נ':50,'ס':60,'ע':70,'פ':80,'צ':90,'ק':100,'ר':200,'ש':300,'ת':400,'ך':20,'ם':40,'ן':50,'ף':80,'ץ':90};

    static calculateGematria(str) {
        if (!str) return 1;
        return str.split('').reduce((sum, char) => sum + (this.gematriaMap[char] || 0), 0) || 1;
    }

    static applyModifiers(baseGeometry, modifiers) {
        if (!modifiers || modifiers.length === 0) return { geometry: baseGeometry };

        let matrices = [new THREE.Matrix4()];

        modifiers.forEach(mod => {
            let nextMatrices = [];
            const count = mod.type === 'gematria' ? this.calculateGematria(mod.text) : (mod.count || 1);
            
            matrices.forEach(baseMatrix => {
                for (let i = 0; i < Math.min(count, 50); i++) { // Safety cap
                    const m = baseMatrix.clone();
                    if (mod.type === 'array' || mod.type === 'gematria') {
                        const offset = mod.offset || { x: 0, y: 1, z: 0 };
                        m.multiply(new THREE.Matrix4().makeTranslation(offset.x * i, offset.y * i, offset.z * i));
                        if (mod.rotation) {
                            m.multiply(new THREE.Matrix4().makeRotationY(THREE.MathUtils.degToRad(mod.rotation * i)));
                        }
                    } else if (mod.type === 'radial') {
                        const radius = mod.radius || 5;
                        const angle = (i / count) * Math.PI * 2;
                        m.multiply(new THREE.Matrix4().makeTranslation(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
                    }
                    nextMatrices.push(m);
                }
            });
            matrices = nextMatrices;
        });

        const geometries = matrices.map(m => baseGeometry.clone().applyMatrix4(m));
        return { geometry: BufferGeometryUtils.mergeGeometries(geometries) };
    }
}
