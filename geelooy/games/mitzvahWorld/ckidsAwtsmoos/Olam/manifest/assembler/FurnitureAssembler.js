// B"H
/**
 * @file FurnitureAssembler.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE FURNITURE ASSEMBLER — Data-Driven Interior Manifestation            ║
 * ║                                                                          ║
 * ║  "And you shall make a table of acacia wood..."                          ║
 * ║                                                                          ║
 * ║  Populates ProceduralBuildings with tables, couches, and other Domem.    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export default class FurnitureAssembler {
    /**
     * @method spawn
     * @description Orchestrates the manifestation of furniture inside a building.
     */
    static async spawn(building, room, furnData, idSuffix, roomOffset) {
        const olam = building.olam;
        if (!olam || !olam.nivrayim) return;

        const fId = `${building.name}_furn_${idSuffix}`;
        const bPos = building.position?.vector3 ? building.position.vector3() : building.position;
        const bRot = building.rotation; // Should be applied if building is rotated

        const localPos = {
            x: (furnData.pos?.[0] || 0) + roomOffset[0],
            y: (furnData.pos?.[1] || 0) + roomOffset[1],
            z: (furnData.pos?.[2] || 0) + roomOffset[2]
        };

        const worldPos = {
            x: (bPos?.x || 0) + localPos.x,
            y: (bPos?.y || 0) + localPos.y,
            z: (bPos?.z || 0) + localPos.z
        };

        // B"H: Mapping furniture types to their spiritual forms
        const furnitureMeta = {
            chair: { color: "#5d4037", scale: furnData.scale || [1.2, 1.2, 1.2], interactable: true },
            couch: { color: "#8d6e63", scale: furnData.scale || [4, 1.5, 2], interactable: true },
            table: { color: "#795548", scale: furnData.scale || [4, 1, 3] },
            bed: { color: "#3e2723", scale: furnData.scale || [3, 1, 5] },
            bookshelf: { color: "#4e342e", scale: furnData.scale || [5, 10, 1] },
            aron_kodesh: { color: "#ffc107", scale: furnData.scale || [4, 10, 2] },
            bimah: { color: "#8d6e63", scale: furnData.scale || [6, 2, 6] }
        };

        // B"H: Special Handling for Stairs (Elevating the Soul)
        if (furnData.type === "stairs") {
            const manifest = { 
                Stairs: { 
                    [fId]: {
                        name: "Holy Ascent",
                        dimensions: { x: 5, y: furnData.targetY || 10, z: 8 },
                        position: worldPos,
                        isSolid: true
                    } 
                } 
            };
            const ChasveiAwtsmoos = (await import('../../../utils/ChasveiAwtsmoos.js')).default;
            await ChasveiAwtsmoos.emanate(manifest.Stairs, manifest);
            
            const newEntities = manifest.Stairs;
            const keys = Object.keys(newEntities);
            if (keys.length > 0) {
                const ent = newEntities[keys[0]];
                const { NivrahFactory } = await import('../../worlds/mitzvahWorld/NivrahFactory.js');
                const factory = new NivrahFactory(olam.scene, olam.worldOctree, olam);
                await factory.buildAll([{ ...ent, id: keys[0] }]);
            }
            return;
        }

        const meta = furnitureMeta[furnData.type] || { color: "#5d4037", scale: furnData.scale || [2, 2, 2] };

        const nivraData = {
            type: "domem",
            name: `Sacred ${furnData.type.charAt(0).toUpperCase() + furnData.type.slice(1)}`,
            golem: { 
                guf: { BoxGeometry: meta.scale }, 
                toyr: { MeshStandardMaterial: { color: meta.color } } 
            },
            position: { ...worldPos, y: worldPos.y + (meta.scale[1] / 2) },
            isSolid: true,
            interactable: meta.interactable || false
        };

        // B"H: Special logic for sitting on chairs or couches
        if (furnData.type === "chair" || furnData.type === "couch") {
            nivraData.onInteraction = (chossid) => {
                if (chossid && chossid.mesh) {
                    const sitPos = { x: worldPos.x, y: worldPos.y + 1.2, z: worldPos.z };
                    chossid.mesh.position.set(sitPos.x, sitPos.y, sitPos.z);
                    if (chossid.olam) {
                        chossid.olam.ayshPeula("ui event", "toast", { 
                            message: "B\"H - You are resting your soul upon this vessel." 
                        });
                    }
                }
            };
        }

        // B"H: Dynamically add to Olam
        const ChasveiAwtsmoos = (await import('../../../utils/ChasveiAwtsmoos.js')).default;
        
        // Construct a mini-manifest to pass to the engine
        const manifest = { Domem: { [fId]: nivraData } };
        await ChasveiAwtsmoos.emanate(manifest.Domem, manifest);

        const newEntities = manifest.Domem;
        const keys = Object.keys(newEntities);
        if (keys.length > 0) {
            const ent = newEntities[keys[0]];
            const { NivrahFactory } = await import('../../worlds/mitzvahWorld/NivrahFactory.js');
            const factory = new NivrahFactory(olam.scene, olam.worldOctree, olam);
            await factory.buildAll([{ ...ent, id: keys[0] }]);
        }
    }
}
