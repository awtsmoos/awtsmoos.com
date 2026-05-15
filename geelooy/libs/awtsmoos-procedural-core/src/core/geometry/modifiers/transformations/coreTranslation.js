
// B"H
/**
 * @file coreTranslation.js
 * @chapter THE SHIFTING OF THE LETTERS
 * 
 * THE HYMN OF SPATIAL MOVEMENT:
 * When we translate a face, we are not merely moving abstract numbers;
 * We are shifting the very letters of creation (Aleph, Beis, Nun)
 * that sustain that face's existence in the present moment!
 */

import { Vec3 } from '../../../math/vec3.js';
import { queryFaces } from '../../selection/faceQuery.js';
import { executeCondition } from '../../../logic/pureConditionals.js';

const getQueryObj = (mod) => executeCondition(typeof mod === 'object', () => mod.query || mod.face, () => mod);
const getTargetFaces = (mesh, queryObj) => executeCondition(typeof queryObj === 'number', () => [queryObj], () => queryFaces(mesh, queryObj));

export const translateFaceModifier = (mesh, mod, direction, amount) => {
    return executeCondition(mesh && mesh.faces, () => {
        const isObj = typeof mod === 'object';
        const queryObj = getQueryObj(mod);
        const moveDir = executeCondition(isObj && mod.direction, () => mod.direction, () => direction);
        const moveAmount = executeCondition(isObj && mod.amount !== undefined, () => mod.amount, () => amount);

        return executeCondition(moveDir && moveDir.length === 3, () => {
            const targetFaces = getTargetFaces(mesh, queryObj);

            return executeCondition(targetFaces && targetFaces.length > 0, () => {
                const moveVec = Vec3.scale(Vec3.normalize(moveDir), moveAmount);
                const originalPositions = [];
                const newPositions = [];
                const processedHashes = new Set();

                targetFaces.forEach(fIdx => {
                    executeCondition(fIdx >= 0 && fIdx < mesh.faces.length, () => {
                        mesh.faces[fIdx].vertices.forEach(v => {
                            const hash = `${v.pos[0]}_${v.pos[1]}_${v.pos[2]}`;
                            executeCondition(!processedHashes.has(hash), () => {
                                processedHashes.add(hash);
                                originalPositions.push([...v.pos]);
                                newPositions.push(Vec3.add(v.pos, moveVec));
                            });
                        });
                    });
                });

                mesh.faces.forEach(face => {
                    face.vertices.forEach(vertex => {
                        originalPositions.forEach((origPos, i) => {
                            executeCondition(Vec3.equals(vertex.pos, origPos), () => {
                                vertex.pos = [...newPositions[i]];
                            });
                        });
                    });
                });

                return mesh;
            }, () => mesh);
        }, () => mesh);
    }, () => mesh);
};
