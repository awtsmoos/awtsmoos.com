// B"H
/**
 * @file EntranceManifest.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE MANIFEST OF THE THRESHOLD — Pure Data Logic                         ║
 * ║                                                                          ║
 * ║  "Open for me the gates of righteousness..." (Tehillim 118:19)           ║
 * ║                                                                          ║
 * ║  A purely data-driven description of how doors and mezuzahs should be    ║
 * ║  positioned. Replaces the imperative calculations in JS.                 ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export const ENTRANCE_MANIFEST = {
    "params": {
        "door_width_padding": 0.98,
        "door_height_padding": 0.995,
        "mezuzah_width": 0.15,
        "mezuzah_height": 0.5,
        "mezuzah_depth": 0.1
    },
    "emanations": [
        // ── THE INTERACTIVE DOOR ──
        {
            "type": "InteractiveDoor",
            "name": { "$concat": [ "Door_", { "$var": "idSuffix" } ] },
            "position": {
                "x": { "$var": "hinge.hx" },
                "y": { "$var": "hinge.hy" },
                "z": { "$var": "hinge.hz" }
            },
            "rotation": {
                "y": { "$var": "hinge.rotY" }
            },
            "golem": {
                "guf": { 
                    "DoorGeometry": [
                        { "$mul": [ { "$var": "ent.width" }, { "$var": "door_width_padding" } ] },
                        { "$mul": [ { "$var": "ent.height" }, { "$var": "door_height_padding" } ] },
                        { "$var": "room.wallThickness" }
                    ]
                },
                "toyr": {
                    "MaterialArray": [
                        { "AwtsmoosWoodMaterial": { "color": "#4e342e" } },
                        { "MeshStandardMaterial": { "color": "#FFD700", "metalness": 1.0, "roughness": 0.1 } }
                    ]
                }
            },
            "isSolid": true,
            "interactable": true,
            "proximity": 80.0,
            "isLocked": { "$var": "building.isLocked" },
            "keyId": { "$var": "building.keyId" }
        },
        
        // ── THE SACRED MEZUZAH ──
        {
            "type": "Domem",
            "name": "Mezuzah",
            "position": {
                "x": { "$add": [ { "$var": "hinge.hx" }, { "$mul": [ { "$var": "ent.width" }, 0.45 ] } ] },
                "y": { "$add": [ { "$var": "hinge.hy" }, { "$mul": [ { "$var": "ent.height" }, 0.65 ] } ] },
                "z": { "$add": [ { "$var": "hinge.hz" }, 0.1 ] }
            },
            "rotation": {
                "y": { "$var": "hinge.rotY" }
            },
            "golem": {
                "guf": { "BoxGeometry": [ 0.15, 0.5, 0.1 ] },
                "toyr": { "MeshStandardMaterial": { "color": "#FFD700", "metalness": 0.8, "roughness": 0.2 } }
            },
            "isSolid": false
        }
    ]
};
