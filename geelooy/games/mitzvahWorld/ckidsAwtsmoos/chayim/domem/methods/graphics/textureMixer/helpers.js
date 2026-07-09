
// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export async function loadTextures(olam, baseTexture, overlayTexture, repeatX, repeatY, nivra) {
    // B"H: silent

    const bTexStr = olam.$gc(baseTexture) || baseTexture;
    const oTexStr = olam.$gc(overlayTexture) || overlayTexture;

    // B"H: silent

    // B"H: silent


    const base = await olam.loadTexture({ url: bTexStr, shouldRepeat: true, repeatX, repeatY, nivra });
    const overlay = await olam.loadTexture({ url: oTexStr, shouldRepeat: true, repeatX, repeatY, nivra });

    if (base) {
        base.wrapS = base.wrapT = THREE.RepeatWrapping;
        // B"H: silent

    } else {
        console.warn("B\"H [TextureMixerHelpers] FAILED to load base texture.");
    }

    if (overlay) {
        overlay.wrapS = overlay.wrapT = THREE.RepeatWrapping;
        // B"H: silent

    } else {
        console.warn("B\"H [TextureMixerHelpers] FAILED to load overlay texture.");
    }

    return { base, overlay };
}

export function findTargetMesh(nivra, childNameToSetItTo) {
    let targetChild = null;
    // B"H: silent

    
    if (nivra.mesh) {
        nivra.mesh.traverse((child) => {
            if (!targetChild && child.isMesh && child.name.includes(childNameToSetItTo)) {
                targetChild = child;
                // B"H: silent

            }
        });
    }

    if (!targetChild) {
        console.error(`B"H [TextureMixerHelpers] CRITICAL: Target child '${childNameToSetItTo}' not found in ${nivra.name}. Available children:`);
        if (nivra.mesh) {
             nivra.mesh.traverse(c => {
                 // B"H: silent
             });
        } else {
             // B"H: silent

        }
    }
    return targetChild;
}

export function processPathObject(nivra, pathChildName, MAX_SEGMENTS_FOR_SHADER) {
    let pathObject = null;
    const pathSegments = [];
    let numActualSegments = 0;
    
    // B"H: silent


    if (pathChildName) {
        nivra.mesh.traverse(child => {
            if (child.name === pathChildName && child.geometry) {
                pathObject = child;
            }
        });
    }

    if (pathObject) {
        // B"H: silent

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
                if (i < 10) // B"H: silent

            }
            console.groupEnd();

            const step = Math.max(1, Math.ceil(worldVertices.length / MAX_SEGMENTS_FOR_SHADER));
            let segIndex = 0;

            // B"H: silent


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
            // B"H: silent

        } else {
            console.warn("B\"H [TextureMixerHelpers] Path object has no position attribute.");
        }
    } else {
        // B"H: silent

    }
    
    return { pathSegments, numActualSegments, usePathMixing: !!pathObject };
}
