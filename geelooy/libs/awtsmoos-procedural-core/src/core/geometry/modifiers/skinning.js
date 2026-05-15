
// B"H
/**
 * @file skinning.js
 * @brief High-precision regional skinning with absolute anatomical safeguards.
 * 
 * THE HYMN OF THE SEPARATE JAW:
 * The Upper and Lower must part ways,
 * To speak the words of Ancient Days.
 * A line is drawn across the face,
 * Dividing the bone's influence in space.
 * Below the line, the Jaw holds sway,
 * Above, the Skull commands the clay.
 */
import { Vec3 } from '../../math/vec3.js';
import { Skeleton } from '../../animation/skeleton.js';

const BONES_PER_VERTEX = 4;
const MOUTH_SPLIT_Y = 2.75; // The divine dividing line between Upper and Lower lips

function distSqToSegment(p, a, b) {
    const ab = Vec3.sub(b, a);
    const ap = Vec3.sub(p, a);
    const e = Vec3.dot(ap, ab);
    const f = Vec3.dot(ab, ab);
    if (f < 0.0001) return Vec3.distSq(p, a);
    let t = Math.max(0.0, Math.min(1.0, e / f));
    const closest = Vec3.add(a, Vec3.scale(ab, t));
    return Vec3.distSq(p, closest);
}

export function skinningModifier(mesh, skeletonData) {
    if (!skeletonData || !skeletonData.bones) return mesh;

    const skeleton = new Skeleton(skeletonData.bones);
    skeleton.updateWorldMatrices();

    const boneSegments = skeleton.bones.map(bone => {
        const start = [bone.worldMatrix[12], bone.worldMatrix[13], bone.worldMatrix[14]];
        const ends =[];
        
        if (bone.id === 'skull_upper') {
            ends.push([start[0], start[1] + 1.2, start[2]]);
        } else if (bone.id === 'jaw') {
            // Jaw extends forward towards the chin
            ends.push([start[0], start[1] - 0.2, start[2] + 0.8]);
        } else if (bone.children.length > 0) {
            bone.children.forEach(c => ends.push([c.worldMatrix[12], c.worldMatrix[13], c.worldMatrix[14]]));
        } else {
            const yAxis =[bone.worldMatrix[4], bone.worldMatrix[5], bone.worldMatrix[6]];
            ends.push(Vec3.add(start, Vec3.scale(Vec3.normalize(yAxis), 0.5)));
        }
        return { start, ends, id: bone.id };
    });

    const processedVertices = new Set();
    
    mesh.faces.forEach(face => {
        face.vertices.forEach(vertex => {
            if (processedVertices.has(vertex)) return;

            const influences =[];
            for (let i = 0; i < skeleton.bones.length; i++) {
                const segmentData = boneSegments[i];
                const y = vertex.pos[1];
                const z = vertex.pos[2];

                // B"H - THE ANATOMICAL DECREE
                
                // 1. JAW RULE: Only affects geometry BELOW the mouth split
                if (segmentData.id === 'jaw') {
                    if (y > MOUTH_SPLIT_Y) continue; // Upper lip forbidden
                    if (z < 0.0) continue; // Neck/Back of head forbidden
                }
                
                // 2. SKULL RULE: Only affects geometry ABOVE the mouth split (mostly)
                if (segmentData.id === 'skull_upper' || segmentData.id === 'head') {
                    // If we are deep in the chin (low Y, forward Z), ignore skull
                    if (y < MOUTH_SPLIT_Y - 0.1 && z > 0.5) continue;
                }
                
                // 3. NECK RULE: Should not grab the face
                if (segmentData.id === 'neck' && z > 0.4 && y > 1.5) continue;

                let minDistSq = Infinity;
                for (const end of segmentData.ends) {
                    const d = distSqToSegment(vertex.pos, segmentData.start, end);
                    if (d < minDistSq) minDistSq = d;
                }

                // Steep falloff for sharp isolation
                const weight = 1.0 / (Math.pow(minDistSq, 4.0) + 0.0001);
                influences.push({ index: i, weight: weight });
            }

            influences.sort((a, b) => b.weight - a.weight);
            const top = influences.slice(0, BONES_PER_VERTEX);
            let total = top.reduce((sum, inf) => sum + inf.weight, 0);
            
            vertex.boneIndices =[0, 0, 0, 0];
            vertex.boneWeights =[0, 0, 0, 0];
            
            if (total > 0) {
                top.forEach((inf, i) => {
                    vertex.boneIndices[i] = inf.index;
                    vertex.boneWeights[i] = inf.weight / total;
                });
            } else {
                // Default to root/pelvis if lost
                vertex.boneWeights[0] = 1.0; 
            }
            processedVertices.add(vertex);
        });
    });
    
    mesh.boneIndices =[]; 
    mesh.boneWeights =[];
    return mesh;
}
