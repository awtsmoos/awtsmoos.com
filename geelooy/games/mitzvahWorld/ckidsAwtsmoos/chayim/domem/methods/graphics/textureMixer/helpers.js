
// B"H
import * as THREE from '/games/scripts/build/three.module.js';

export async function loadTextures(olam, baseTexture, overlayTexture, repeatX, repeatY, nivra) {
    console.log("B\"H [TextureMixerHelpers] Loading textures...");
    const bTexStr = olam.$gc(baseTexture) || baseTexture;
    const oTexStr = olam.$gc(overlayTexture) || overlayTexture;

    console.log("B\"H [TextureMixerHelpers] Base URL:", bTexStr);
    console.log("B\"H [TextureMixerHelpers] Overlay URL:", oTexStr);

    const base = await olam.loadTexture({ url: bTexStr, shouldRepeat: true, repeatX, repeatY, nivra });
    const overlay = await olam.loadTexture({ url: oTexStr, shouldRepeat: true, repeatX, repeatY, nivra });

    if (base) {
        base.wrapS = base.wrapT = THREE.RepeatWrapping;
        console.log("B\"H [TextureMixerHelpers] Base texture loaded successfully.");
    } else {
        console.warn("B\"H [TextureMixerHelpers] FAILED to load base texture.");
    }

    if (overlay) {
        overlay.wrapS = overlay.wrapT = THREE.RepeatWrapping;
        console.log("B\"H [TextureMixerHelpers] Overlay texture loaded successfully.");
    } else {
        console.warn("B\"H [TextureMixerHelpers] FAILED to load overlay texture.");
    }

    return { base, overlay };
}

export function findTargetMesh(nivra, childNameToSetItTo) {
    let targetChild = null;
    console.log(`B"H [TextureMixerHelpers] Searching for child '${childNameToSetItTo}' in ${nivra.name}`);
    
    if (nivra.mesh) {
        nivra.mesh.traverse((child) => {
            if (!targetChild && child.isMesh && child.name.includes(childNameToSetItTo)) {
                targetChild = child;
                console.log("B\"H [TextureMixerHelpers] Found Target Mesh:", child.name);
            }
        });
    }

    if (!targetChild) {
        console.error(`B"H [TextureMixerHelpers] CRITICAL: Target child '${childNameToSetItTo}' not found in ${nivra.name}. Available children:`);
        if (nivra.mesh) {
             nivra.mesh.traverse(c => console.log("- " + c.name));
        } else {
             console.log("Nivra mesh is null!");
        }
    }
    return targetChild;
}

export function processPathObject(nivra, pathChildName, MAX_SEGMENTS_FOR_SHADER) {
    let pathObject = null;
    const pathSegments = [];
    let numActualSegments = 0;
    
    console.log(`B"H [TextureMixerHelpers] Searching for path object '${pathChildName}'`);

    if (pathChildName) {
        nivra.mesh.traverse(child => {
            if (child.name === pathChildName && child.geometry) {
                pathObject = child;
            }
        });
    }

    if (pathObject) {
        console.log("B\"H [TextureMixerHelpers] Found path object:", pathChildName);
        pathObject.visible = false;
        pathObject.updateMatrixWorld(true);

        const positions = pathObject.geometry.attributes.position;
        if (positions) {
            const worldVertices = [];
            // Log vertices for debugging (comment out in prod if too spammy, but requested "EXTREME LOGGING")
            console.groupCollapsed("B\"H [TextureMixerHelpers] Path Vertices");
            for (let i = 0; i < positions.count; i++) {
                const localPoint = new THREE.Vector3().fromBufferAttribute(positions, i);
                const worldPoint = localPoint.clone().applyMatrix4(pathObject.matrixWorld);
                worldVertices.push(worldPoint);
                if (i < 10) console.log(`Vertex ${i}:`, worldPoint);
            }
            console.groupEnd();

            const step = Math.max(1, Math.ceil(worldVertices.length / MAX_SEGMENTS_FOR_SHADER));
            let segIndex = 0;

            console.log(`B"H [TextureMixerHelpers] Processing segments. Total: ${worldVertices.length}, Step: ${step}`);

            for (let i = 0; i < worldVertices.length - 1; i += step) {
                if (segIndex * 2 >= MAX_SEGMENTS_FOR_SHADER * 2) {
                    console.warn("B\"H [TextureMixerHelpers] Max segments reached, truncating path.");
                    break;
                }

                if (worldVertices[i] && worldVertices[i + 1]) {
                    pathSegments.push(worldVertices[i]);
                    pathSegments.push(worldVertices[i + 1]);
                    segIndex++;
                }
            }
            numActualSegments = segIndex;
            console.log(`B"H [TextureMixerHelpers] Final path segments count: ${numActualSegments}`);
        } else {
            console.warn("B\"H [TextureMixerHelpers] Path object has no position attribute.");
        }
    } else {
        console.log("B\"H [TextureMixerHelpers] No path object found.");
    }
    
    return { pathSegments, numActualSegments, usePathMixing: !!pathObject };
}
