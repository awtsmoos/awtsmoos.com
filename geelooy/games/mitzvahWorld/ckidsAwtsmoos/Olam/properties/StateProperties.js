
/**
 * B"H
 * @module StateProperties
 * @description 
 * 💾 THE MEMORY OF THE UNIVERSE (DA'AS) 💾
 */
import * as THREE from '/games/scripts/build/three.module.js';

export const getStateProperties = () => ({
    clock: new THREE.Clock(),
    deltaTime: 1,
    currentLoadingPercentage: 0,
    destroyed: false,
    components: {},
    vars: {},
    assets: {},
    shlichusHandler: null,
    completedShlichuseem: [],
    startedShlichuseem: [],
    isHeesHawvoos: false,
    nivrayim: [],
    nivrayimWithShlichuseem: [],
    nivrayimWithDialogue: [],
    interactableNivrayim: [],
    nivrayimWithPlaceholders: [],
    nivrayimWithEntities: [],
    meshesToInteractWith: [],
    html: null,
    waterMesh: null
});
