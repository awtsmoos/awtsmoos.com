
/**
 * B"H
 * @file characterMaker.js
 * A tool to design custom NPCs.
 */

import Tool from "./tool.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class CharacterMaker extends Tool {
    type = "characterMaker";
    static itemName = "Neshama Maker";
    static description = "Design a new soul (NPC) with custom dialogue and purpose.";
    static icon = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MTIgNTEyIj48Y2lyY2xlIGN4PSIyNTYiIGN5PSIyNTYiIHI9IjIwMCIgZmlsbD0iIzRmNDRmNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIwIi8+PHBhdGggZD0iTTE1NiAxNTZhMTAwIDEwMCAwIDAgMSAyMDAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMDAwIiBzdHJva2Utd2lkdGg9IjIwIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4="; 

    constructor(op) {
        if (!op.golem) {
            op.golem = {
                guf: { BoxGeometry: [0.5, 0.1, 0.8] },
                toyr: { MeshLambertMaterial: { color: "#00FFFF" } }
            };
        }
        super(op);
    }

    async shoot() {
        // Open the Character Designer UI by sending the UI event
        // This corresponds to the 'open' handler in characterDesigner.js
        this.olam.ayshPeula("ui event", "character designer", {
            open: { 
                mode: 'create' 
            }
        });
    }
}
