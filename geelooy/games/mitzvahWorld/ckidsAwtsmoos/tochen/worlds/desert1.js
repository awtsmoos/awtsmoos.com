// B"H
/**
 * @module desert1
 * @description THE WILDERNESS OF MIDBAR
 * A vast expanse of sand where the soul learns to be an empty vessel.
 */
export default {
    shaym: "Midbar",
    nivrayim: {
        ProceduralTerrain: {
            ground: {
                name: "Desert Dunes", width: 1500, depth: 1500, segments: 100, 
                textureType: "sand", 
                hills:[
                    { x: 100, z: 100, radius: 200, height: 40 },
                    { x: -200, z: -300, radius: 300, height: 50 },
                    { x: 400, z: -100, radius: 150, height: 35 }
                ],
                position: { x: 0, y: -1, z: 0 }, isSolid: true
            }
        },
        Domem: {
            oasis_rock: {
                name: "Rock of Ages",
                golem: { guf: { SphereGeometry: [10, 16, 16] }, toyr: { MeshStandardMaterial: { color: "#8b4513" } } },
                position: { x: 0, y: 5, z: 0 }, isSolid: true
            },
            scattered_rock_1: {
                name: "Desert Stone",
                golem: { guf: { BoxGeometry: [5, 3, 5] }, toyr: { MeshStandardMaterial: { color: "#a0522d" } } },
                position: { x: 150, y: 1.5, z: 200 }, isSolid: true
            }
        },
        ProceduralBuilding: {
            oasis_shelter: {
                name: "Oasis_Sanctuary",
                blueprint: {
                    rooms: [{ width: 15, height: 10, depth: 15, wallThickness: 1, offset: [0, 0, 0], 
                             entrances: [{ wall: 'front', width: 4, height: 6, offset: 0 }] }],
                    npcs: [{ name: "Desert Sage", x: 2, z: 2, dialogues: ["B\"H! In the silence of the desert, the Voice is heard."] }]
                },
                position: { x: 0, y: 0.1, z: 20 }, isSolid: true
            }
        },
        Chossid: {
            me: {
                height: 2.2, radius: 0.45, name: "player", speed: 6, interactable: true, 
                position: { x: 10, y: 40, z: 10 }
            }
        }
    }
};

