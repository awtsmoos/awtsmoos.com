
/**
 * B"H
 * @module SceneProperties
 * @description 
 * 🎭 THE STAGE OF THE DRAMA (TIFERET) 🎭
 * 
 * Holds the core graphical groupings.
 */
import * as THREE from '/games/scripts/build/three.module.js';

export const getSceneProperties = () => ({
    scene: new THREE.Scene(),
    nivrayimGroup: new THREE.Group(),
    ohros: [],
    enlightened: false,
    objectsInScene: []
});
