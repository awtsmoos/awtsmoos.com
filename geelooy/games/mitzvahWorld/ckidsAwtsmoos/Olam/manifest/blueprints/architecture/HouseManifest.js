// B"H
/**
 * @file HouseManifest.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE MANIFEST OF THE SANCTUARY — House Data Structure                    ║
 * ║                                                                          ║
 * ║  "And they shall build houses and inhabit them..." (Yeshayahu 65:21)     ║
 * ║                                                                          ║
 * ║  A purely data-driven description of a multi-room procedural house.      ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export const HOUSE_MANIFEST = {
    "params": {
        "default_width": 12,
        "default_height": 12,
        "default_depth": 12,
        "default_wall_thickness": 1
    },
    "geometry": {
        "emanations": [
            {
                "builder": "WallBuilder",
                "args": {
                    "width": { "$var": "room.width" },
                    "height": { "$var": "room.height" },
                    "depth": { "$var": "room.depth" },
                    "thickness": { "$var": "room.wallThickness" }
                }
            },
            {
                "builder": "RoofBuilder",
                "condition": { "$neq": [ { "$var": "room.hasRoof" }, false ] },
                "args": {
                    "width": { "$var": "room.width" },
                    "depth": { "$var": "room.depth" }
                }
            }
            // ... more builders
        ]
    }
};
