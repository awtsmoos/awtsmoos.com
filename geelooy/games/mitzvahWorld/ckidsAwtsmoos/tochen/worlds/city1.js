// B"H
/**
 * @module city1
 * @description THE CITY OF YEESHOOV
 * A dense urban manifestation where every skyscraper is a pillar of the community.
 */
export default {
    shaym: "Yeeshoov",
    nivrayim: {
        ProceduralTerrain: {
            ground: {
                name: "City Pavement", width: 1000, depth: 1000, segments: 10, 
                textureType: "stone", position: { x: 0, y: -0.5, z: 0 }, isSolid: true
            }
        },
        ProceduralRoad: {
            main_grid: {
                name: "Avenue of Unity", 
                points: [[-500, 0], [0, 0], [500, 0]], 
                width: 20, sidewalkWidth: 5, isSolid: true
            },
            cross_grid: {
                name: "Street of Torah", 
                points: [[0, -500], [0, 0], [0, 500]], 
                width: 15, sidewalkWidth: 4, isSolid: true
            }
        },
        ProceduralBuilding: {
            office_tower_1: {
                name: "Awtsmoos Heights",
                blueprint: {
                    rooms: [
                        { width: 40, height: 100, depth: 40, wallThickness: 2, offset: [100, 0, 100], 
                          entrances: [{ wall: 'front', width: 10, height: 15, offset: 0 }] }
                    ],
                    npcs: [{ name: "City Guard", x: 100, z: 120, dialogues: ["B\"H! Protecting the city is a holy task."] }]
                },
                position: { x: 100, y: 0, z: 100 }, isSolid: true
            },
            plaza_building: {
                name: "Community Center",
                blueprint: {
                    rooms: [{ width: 60, height: 15, depth: 60, wallThickness: 1, offset: [-100, 0, -100], 
                             entrances: [{ wall: 'front', width: 8, height: 10, offset: 0 }] }]
                },
                position: { x: -100, y: 0, z: -100 }, isSolid: true
            }
        },
        Chossid: {
            me: {
                height: 1.5, name: "player", speed: 180, interactable: true, 
                path: "awtsmoos://awduhm", position: { x: 20, y: 5, z: 20 }
            }
        }
    }
};

