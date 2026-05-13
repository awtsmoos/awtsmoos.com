
// B"H
/**
 * @module AwtsmoosOctree/methods/build/index
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════════════╗
 * ║  THE GRAND UNIFICATION OF BUILD METHODS — YICHUD ELYON                        ║
 * ╚══════════════════════════════════════════════════════════════════════════════════╝
 *
 * @file index.js
 * @memberof AwtsmoosOctree/methods/build
 */
import fromGraphNode from './fromGraphNode.js';
import build from './build.js';
import dynamicTriangles from './dynamicTriangles.js';
import removeMesh from './removeMesh.js';
import getTriangle from './getTriangle.js';

export default {
    ...getTriangle,      
    ...build,            
    ...fromGraphNode,    
    ...dynamicTriangles, 
    ...removeMesh        
};
