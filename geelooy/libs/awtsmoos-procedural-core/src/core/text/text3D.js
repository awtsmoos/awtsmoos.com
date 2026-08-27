// B"H
import { createExtrudedShapeMesh } from '../geometry/primitives/extrudedShape.js';
import { meshToRenderData } from '../geometry/utils/meshData.js';
import { generateTextBitmap } from './textBitmap.js';
import { traceContours } from './contourTracer.js';
import { simplifyPath } from './pathSimplifier.js';

export function create3DText(text, config = {}) {
    const depth = config.depth || 5.0;
    const color = config.color || [1, 1, 1, 1];
    const finalMeshes = [];
    
    console.log("B\"H - Text3D: Using High-Res Canvas Fallback (Solid Mode).");
    
    const bitmap = generateTextBitmap(text, 250); 
    const rawContours = traceContours(bitmap);
    
    const scale = 0.04;
    const cx = bitmap.width / 2;
    const cy = bitmap.height / 2;

    rawContours.forEach((contour, i) => {
        // For solid text, we ignore holes.
        if (contour.isHole) return;

        const simplified = simplifyPath(contour.points, 2.0);
        
        // Map to XZ plane for extrusion
        const shape = simplified.map(p => [
            (p[0] - cx) * scale,
            // B"H - Y-coordinates from canvas are inverted in WebGL
            -(p[1] - cy) * scale 
        ]);

        const meshRaw = createExtrudedShapeMesh({
            shape: shape,
            holes: [], // Holes can be implemented by passing other contours here
            depth: depth, 
            color: color
        });
        
        if (meshRaw.faces.length > 0) {
            let renderMesh = meshToRenderData(meshRaw);
            finalMeshes.push({
                id: `glyph_solid_${i}`,
                primitive: 'none',
                ...renderMesh,
                keyframes: [{ time: 0, position: [0, 0, 0] }]
            });
        }
    });

    if (finalMeshes.length === 0) {
        console.warn("B\"H - Text3D: No geometry generated for text.");
    }

    return {
        id: 'text_group',
        primitive: 'none', 
        children: finalMeshes,
        // B"H - Text is generated on the XY plane from canvas, but extruded along Y in geometry space.
        // We must rotate it to stand up and face the camera.
        keyframes: [{ 
            time: 0, 
            position: [0, 0, 0], 
            rotation: [Math.PI / 2, Math.PI, 0], 
            scale: [1, 1, 1] 
        }]
    };
}