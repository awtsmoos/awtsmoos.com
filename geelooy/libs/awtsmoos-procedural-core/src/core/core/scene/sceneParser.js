
// B"H
/**
 * @file sceneParser.js
 * @brief This divine interpreter reads the abstract JSON thought-forms and solidifies them
 *        into tangible WebGL-ready geometries. Now infused with the MetadataParser to prevent amnesia.
 */

import { generateProceduralGeometry } from '../geometry/geometryGenerator.js';
import { MetadataParser } from './parser/metadataParser.js';

export class SceneParser {
    globalShaderVars = {};
    tracks = {}; 
    camera = null; 
    sky = null; 

    _parseObject(objData) {
        let geometry;

        const hasPositions = objData.positions && (Array.isArray(objData.positions) || ArrayBuffer.isView(objData.positions));

        if (hasPositions) {
            geometry = {
                positions: objData.positions,
                colors: objData.colors || [],
                normals: objData.normals ||[],
                indices: objData.indices ||[],
                drawMode: objData.drawMode || 'TRIANGLES'
            };
        } else {
            // B"H - The Geometry Generator modifies objData directly, appending things like exportedPoints!
            geometry = generateProceduralGeometry(
                objData.primitive || 'cube', 
                objData.parameters || {},
                objData.modifiers ||[],
                objData 
            );
        }

        // B"H - Invoke the Scribe to catch the newly generated metadata before it vanishes
        const metadata = MetadataParser.extract(objData);

        const instanceCount = objData.instanceCount || geometry.instanceCount || 0;
        const instanceOffsets = objData.instanceOffsets || geometry.instanceOffsets || null;
        const instanceScales = objData.instanceScales || geometry.instanceScales || null;
        const instanceRotations = objData.instanceRotations || geometry.instanceRotations || null;
        const instanceNormals = objData.instanceNormals || geometry.instanceNormals || null;
        const instanceRandoms = objData.instanceRandoms || geometry.instanceRandoms || null;

        let keyframes = objData.keyframes ||[];
        if (keyframes.length === 0 && (objData.position || objData.rotation || objData.scale)) {
            keyframes = [{
                time: 0,
                position: objData.position ||[0, 0, 0],
                rotation: objData.rotation || [0, 0, 0],
                scale: objData.scale || [1, 1, 1]
            }];
        }

        const parsedObj = {
            id: objData.id,
            visible: objData.visible !== false,
            ...geometry, 
            drawMode: geometry.drawMode || 'TRIANGLES',
            shaderVars: objData.shaderVars || {},
            animations: objData.animations ? [...objData.animations] :[],
            keyframes: keyframes,
            skeleton: objData.skeleton || null,
            attachment: objData.attachment || null, // B"H - Preserve attachment directives!
            exportedPoints: metadata.exportedPoints, // B"H - THE TIKKUN! The points are saved!
            isMetaballSource: objData.isMetaballSource || false,
            isMetaballSurface: objData.isMetaballSurface || false,
            simulation: objData.simulation || null,
            
            // B"H - TIKKUN OF PERCEPTION: Preserve interaction markers so the Ray can see them!
            interactive: objData.interactive || false,
            selectable: objData.selectable || false,
            draggable: objData.draggable || false,
            liveCSG: objData.liveCSG || null,
            
            instanceCount,
            instanceOffsets,
            instanceScales,
            instanceRotations,
            instanceNormals,
            instanceRandoms,
            
            hairParams: objData.hairParams || null,
            children:[] 
        };

        if (keyframes.length > 0) {
            const trackId = `track_${objData.id}_auto`;
            this.tracks[trackId] = keyframes;
            parsedObj.animations.unshift({ track: trackId, speed: 1.0 });
        }

        if (objData.children && Array.isArray(objData.children)) {
            parsedObj.children = objData.children.map(childData => this._parseObject(childData));
        }
        return parsedObj;
    }

    parseScene(sceneData) {
        const rootObjects =[];
        this.tracks = sceneData.tracks || {}; 
        this.camera = sceneData.camera || null;
        this.sky = sceneData.sky || { enabled: true }; 

        if (sceneData.globalShaderVars) {
            this.globalShaderVars = sceneData.globalShaderVars;
        }

        let rawObjects = sceneData.objects;
        if (typeof rawObjects === 'function') {
            try {
                rawObjects = rawObjects();
            } catch (e) {
                console.error('B"H - SceneParser Error: Failed to generate dynamic objects:', e);
                rawObjects =[];
            }
        }

        if (rawObjects && Array.isArray(rawObjects)) {
            rawObjects.forEach(objData => {
                rootObjects.push(this._parseObject(objData));
            });
        }

        return { objects: rootObjects, tracks: this.tracks, camera: this.camera, sky: this.sky };
    }
}
