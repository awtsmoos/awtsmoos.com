// B"H
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";

export default class TopologyFactory {
    static process(geo, op) {
        if (!geo) return null;
        const pos = geo.attributes.position;
        const norm = geo.attributes.normal;
        
        if (op.type === 'move_vertices') {
            const { selection, delta } = op;
            for (let i = 0; i < pos.count; i++) {
                if (this.isMatch(pos, norm, i, selection)) {
                    pos.setXYZ(
                        i, 
                        pos.getX(i) + (delta.x || 0),
                        pos.getY(i) + (delta.y || 0),
                        pos.getZ(i) + (delta.z || 0)
                    );
                }
            }
            pos.needsUpdate = true;
            geo.computeVertexNormals();
        }
        
        return geo;
    }

    static isMatch(pos, norm, i, selection) {
        if (!selection) return true;
        
        // Match by normal direction (e.g. "top faces")
        if (selection.normal) {
            const nx = norm.getX(i);
            const ny = norm.getY(i);
            const nz = norm.getZ(i);
            const target = selection.normal;
            const dot = nx * (target.x || 0) + ny * (target.y || 0) + nz * (target.z || 0);
            if (dot < (selection.threshold || 0.9)) return false;
        }
        
        // Match by position range
        if (selection.min) {
            if (pos.getX(i) < (selection.min.x ?? -Infinity)) return false;
            if (pos.getY(i) < (selection.min.y ?? -Infinity)) return false;
            if (pos.getZ(i) < (selection.min.z ?? -Infinity)) return false;
        }
        if (selection.max) {
            if (pos.getX(i) > (selection.max.x ?? Infinity)) return false;
            if (pos.getY(i) > (selection.max.y ?? Infinity)) return false;
            if (pos.getZ(i) > (selection.max.z ?? Infinity)) return false;
        }

        return true;
    }
}
