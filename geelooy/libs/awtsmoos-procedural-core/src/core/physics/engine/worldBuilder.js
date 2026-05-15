// B"H
import { RigidBody } from './body.js';
import { StaticMeshOctree } from '../spatial/staticMeshOctree.js';
import { mat4_core } from '../../math/mat4/core.js';
import { mat4_transformations } from '../../math/mat4/transformations.js';

function addBody(world, renderObj, config) {
    const body = new RigidBody(renderObj.id, renderObj, config);
    world.bodies.push(body);
    return body;
}

function addStaticMesh(world, renderObj) {
    if (!renderObj.positions || !renderObj.indices) {
        console.error(`B"H - WorldBuilder: Static mesh '${renderObj.id}' missing data.`);
        return;
    }

    let worldPositions = [...renderObj.positions]; 
    if (renderObj.keyframes && renderObj.keyframes[0]) {
        const kf = renderObj.keyframes[0];
        const transform = mat4_core.identity();
        
        // B"H - Matrix construction T*R*S
        if (kf.position) mat4_transformations.translate(transform, kf.position);
        if (kf.rotation) {
            mat4_transformations.rotateX(transform, kf.rotation[0]);
            mat4_transformations.rotateY(transform, kf.rotation[1]);
            mat4_transformations.rotateZ(transform, kf.rotation[2]);
        }
        if (kf.scale) mat4_transformations.scale(transform, kf.scale);

        // B"H - Annihilate manual math. Invoke the sacred transformation.
        const transformed = [];
        const pIn = [0,0,0], pOut = [0,0,0];
        for (let i = 0; i < renderObj.positions.length; i += 3) {
            pIn[0] = renderObj.positions[i];
            pIn[1] = renderObj.positions[i+1];
            pIn[2] = renderObj.positions[i+2];
            mat4_core.transformPoint(pOut, pIn, transform);
            transformed.push(...pOut);
        }
        worldPositions = transformed;
    }

    console.log(`B"H - WorldBuilder: Generating Octree for ${renderObj.id}...`);
    const octree = new StaticMeshOctree(worldPositions, renderObj.indices);
    world.staticColliders.push({
        mesh: { ...renderObj, positions: worldPositions },
        octree: octree
    });
    console.log("B\"H - WorldBuilder: Octree build complete for " + renderObj.id);
}

export function buildFromScene(world, rootObjects) {
    world.clear();
    console.log("B\"H - WorldBuilder: Building physics state from scene graph...");

    const allObjects = [];
    const collectRecursive = (obj) => {
        allObjects.push(obj);
        if(obj.children) obj.children.forEach(collectRecursive);
    };
    rootObjects.forEach(collectRecursive);

    allObjects.forEach(obj => {
        if (obj.simulation) {
            if (obj.simulation.type === 'static_collider') {
                addStaticMesh(world, obj);
            } else if (obj.simulation.type === 'rigid_body') {
                addBody(world, obj, obj.simulation.config || {});
            }
        }
    });
    console.log(`B\"H - WorldBuilder: Build complete. ${world.bodies.length} dynamic bodies, ${world.staticColliders.length} static colliders.`);
}
