// B"H
/**
 * @file EntrancePositions.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  THE GEOMETRY OF THE GATES — Data-Driven Spatial Math                    ║
 * ║                                                                          ║
 * ║  "And he measured the wall..." (Yechezkel 40:5)                         ║
 * ║                                                                          ║
 * ║  Defines the mathematical relationships for entrance placement.          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export const ENTRANCE_POSITION_LOGIC = {
    "front": {
        "hx": { "$add": [ { "$var": "ent.offset" }, { "$div": [ { "$var": "ent.width" }, 2 ] } ] },
        "hy": 0.5,
        "hz": { "$sub": [ { "$div": [ { "$var": "room.depth" }, 2 ] }, { "$var": "room.wallThickness" } ] },
        "rotY": 0
    },
    "back": {
        "hx": { "$sub": [ 0, { "$add": [ { "$var": "ent.offset" }, { "$div": [ { "$var": "ent.width" }, 2 ] } ] } ] },
        "hy": 0.5,
        "hz": { "$add": [ { "$sub": [ 0, { "$div": [ { "$var": "room.depth" }, 2 ] } ] }, { "$var": "room.wallThickness" } ] },
        "rotY": { "$pi": [] }
    },
    "left": {
        "hx": { "$add": [ { "$sub": [ 0, { "$div": [ { "$var": "room.width" }, 2 ] } ] }, { "$var": "room.wallThickness" } ] },
        "hy": 0.5,
        "hz": { "$sub": [ 0, { "$add": [ { "$var": "ent.offset" }, { "$div": [ { "$var": "ent.width" }, 2 ] } ] } ] },
        "rotY": { "$sub": [ 0, { "$div": [ { "$pi": [] }, 2 ] } ] }
    },
    "right": {
        "hx": { "$sub": [ { "$div": [ { "$var": "room.width" }, 2 ] }, { "$var": "room.wallThickness" } ] },
        "hy": 0.5,
        "hz": { "$add": [ { "$var": "ent.offset" }, { "$div": [ { "$var": "ent.width" }, 2 ] } ] },
        "rotY": { "$div": [ { "$pi": [] }, 2 ] }
    }
};
