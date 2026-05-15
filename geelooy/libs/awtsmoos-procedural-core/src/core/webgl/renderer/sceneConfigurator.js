
// B"H
/**
 * @file sceneConfigurator.js
 * @brief Handles scene setup, connecting physics and animations.
 */
import { loadSceneRenderer } from './loader/sceneLoader.js';
import { mat4_core } from '../../math/mat4/core.js';
import { mat4_transformations } from '../../math/mat4/transformations.js';

export function configureScene(renderer, sceneData, orbitControls) {
    const { systemManager, animationManager } = renderer;
    const { cloth: clothSystem, rigidBody: rigidBodySystem, metaball: metaballSystem } = systemManager.physicsSystems;

    if (renderer.uiManager) {
        renderer.uiManager.clearCustomControls();
        if (sceneData.customUI) {
            renderer.uiManager.setCustomUI(sceneData.customUI);
        }
    }

    renderer.sceneData = sceneData;
    clothSystem.objects = [];
    metaballSystem.clear();
    loadSceneRenderer(renderer, sceneData, orbitControls);

    if (systemManager.shadowSystem && renderer.programManager.shadowProgramInfo) {
        systemManager.shadowSystem.init(renderer.programManager.shadowProgramInfo);
    }

    renderer.objectMap.clear();
    const mapRecursive = (obj) => {
        renderer.objectMap.set(obj.id, obj);
        if (obj.children) obj.children.forEach(mapRecursive);
    };
    renderer.rootAnimatedObjects.forEach(mapRecursive);

    if (rigidBodySystem) {
        rigidBodySystem.buildFromScene(renderer.rootAnimatedObjects);
        clothSystem.setStaticColliders(rigidBodySystem.staticColliders);
    }

    const globalVars = renderer.sceneParser ? renderer.sceneParser.globalShaderVars : {};
    clothSystem.setWind(globalVars.uWindVector);

    renderer.objectMap.forEach(obj => {
        if (obj.isMetaballSource && obj.physicsBody) metaballSystem.addMetaball(obj.physicsBody);
        if (obj.isMetaballSurface) metaballSystem.setTargetMesh(obj);
    });

    if (animationManager) {
        const originalGetTransform = animationManager.getInterpolatedTransform.bind(animationManager);
        animationManager.getInterpolatedTransform = (objId, currentTime) => {
            const obj = renderer.objectMap.get(objId);
            if (obj && obj.physicsBody && !obj.physicsBody.isStatic) {
                const p = obj.physicsBody.pos;
                let m = mat4_core.identity(); mat4_transformations.translate(m, p);
                return m;
            }
            return originalGetTransform(objId, currentTime);
        };
    }

    if (sceneData.postLoadCallback) {
        sceneData.postLoadCallback(renderer);
    }
}
