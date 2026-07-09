// B"H
/**
 * @file mezuzahs.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE SEAL OF PROTECTION — Mezuzah Manifestation            ║
 * ║                                                             ║
 * ║  "And you shall write them upon the doorposts..."         ║
 * ║  (Devarim 6:9)                                              ║
 * ║                                                             ║
 * ║  Affixes the sacred scroll-vessels to the entrances.       ║
 * ╚═══════════════════════════════════════════════════════════╝
 */
import * as THREE from "/games/mitzvahWorld/systems/three/AwtsmoosThreeGateway.js";
import ENTRANCE_POSITIONS from '../../../../utils/3d/procedural/house/data/EntrancePositionMap.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

export default {
    async _spawnMezuzah(building, room, ent, idSuffix, roomOffset) {
        const olam = building.olam;
        const positionFn = ENTRANCE_POSITIONS[ent.wall];
        if (!positionFn) return;

        const doorData = positionFn(ent, room);
        const mezuzahPos = new THREE.Vector3(
            doorData.hx + (ent.width * 0.45), 
            doorData.hy + (ent.height * 0.65), 
            doorData.hz + 0.1
        );

        mezuzahPos.add(new THREE.Vector3(...roomOffset));

        this._applyBuildingRotation(mezuzahPos, building);
        this._applyBuildingPosition(mezuzahPos, building);

        const buildingRotY = building.rotation ? (building.rotation.y || 0) : 0;
        const finalRotY = buildingRotY + doorData.rotY;

        return await olam.addObject("Domem", {
            id: `${building.id}_mezuzah_${idSuffix}`,
            name: "Mezuzah",
            golem: {
                guf: { BoxGeometry: [0.15, 0.5, 0.1] },
                toyr: { MeshStandardMaterial: { color: "#FFD700", metalness: 0.8, roughness: 0.2 } }
            },
            position: { x: mezuzahPos.x, y: mezuzahPos.y, z: mezuzahPos.z },
            rotation: { x: 0, y: finalRotY, z: 0 },
            isSolid: false
        });
    }
};
