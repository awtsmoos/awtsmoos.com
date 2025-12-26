
/**
 * B"H
 * Olam Worker Entry Point
 */
import Utils from "../../utils.js";
import * as THREE from '/games/scripts/build/three.module.js';

import inventoryMethods from "./methods/inventory.js";
import worldMethods from "./methods/world.js";
import uiMethods from "./methods/ui.js";
import inputMethods from "./methods/input.js";
import canvasMethods from "./methods/canvas.js";

import("../index.js").then(async r => {
    self.Olam = r.default;
    try {
        await go(r.default);
    } catch(e) {
        console.log("Issue in Worker Start",e)
    }
}).catch(e=> {
    console.log("Failed to load Olam module",e)
})

async function go(OlamClass) {
    var promiseMap = new Map();
    var off = "official";

    function registerPromise(id) {
        return new Promise((resolve, reject) => {
            promiseMap.set(id, { resolve, reject });
        });
    }

    var me = {
        olam: null,
        promiseMap,
        registerPromise
    }

    // Aggregating methods
    var tawfkeedeem = {
        ...inventoryMethods(me),
        ...worldMethods(me, OlamClass),
        ...uiMethods(me),
        ...inputMethods(me),
        ...canvasMethods(me)
    };

    addEventListener("message", async e => {
        var dayuh = e.data;
        if(typeof(dayuh) == "object") {
            try {
                for(var q of Object.keys(dayuh)) {
                    var tawfeek = tawfkeedeem[q];
                    if(typeof(tawfeek) == "function") {
                        var result = await tawfeek(dayuh[q]);
                        
                        var tawch;
                        if(!result) result = {};
                        if(result.tawchlees) {
                            tawch = result.tawchlees
                        };
                        
                        var shouldITransfer = !!result.transfer;
                        postMessage({
                            [q]: tawch
                        }, shouldITransfer ? [tawch] : undefined)
                    }
                }
            } catch(e) {
                console.log("Error executing task:", e);
            }
        }
    });

    console.log("Olam Worker Ready");
    postMessage({ pawsawch: true });
}
