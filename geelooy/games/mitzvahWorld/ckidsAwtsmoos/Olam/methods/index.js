/**
 * B"H
 * 
 * helper methods for Olam
 */
import loading from "./loading.js"
import entityLogic from "./entityLogic.js";
import hebrewLetters from "./hebrewLetters.js"
import heesHawvoos from "./heesHawvoos.js";
import canvasSetup from "./canvasSetup.js";
import ohr from "./ohr.js";
import boyrayNivra from "./boyrayNivra.js";
import helpers from "./helpers.js"
import transforms from "./helpers/transforms.js"; // B"H: Added transforms import
import loadNivrayim from "./loadNivrayim.js";
import tzimtzum from "./tzimtzum.js";
import placeholderAndEntities from "./placeholderAndEntities.js"; 
import hoyseef from "./hoyseef.js";
import sealayk from "./sealayk.js"

export default async function() {
    console.log("B\"H - Olam Methods: Beginning Bind Process...");
    
    const bindModule = (name, classDef) => {
        try {
            // console.log(`B"H - Binding module: ${name}`);
            if(!classDef) {
                console.warn(`B"H - Warning: Module ${name} is null/undefined.`);
                return;
            }
            
            // B"H: Check if it's a class or object literal
            const proto = classDef.prototype || classDef;
            
            Object.keys(proto).forEach(w => {
                 if (w !== "constructor") {
                     // Check if property is a function before binding
                     if (typeof proto[w] === 'function') {
                         this[w] = proto[w].bind(this);
                     } else {
                         this[w] = proto[w]; // Copy value/object directly
                     }
                 }
            });
            
            // Also handle getOwnPropertyNames for classes to catch non-enumerable methods
            if(classDef.prototype) {
                Object.getOwnPropertyNames(classDef.prototype).forEach(w => {
                    if(w != "constructor") {
                        this[w] = classDef.prototype[w]?.bind(this);
                    }
                });
            }
            
        } catch(e) {
            console.error(`B"H - Error binding module ${name}:`, e);
            throw e;
        }
    };

    try {
        bindModule("hoyseef", hoyseef);
        bindModule("boyrayNivra", boyrayNivra);
        bindModule("loadNivrayim", loadNivrayim);
        bindModule("tzimtzum", tzimtzum);
        bindModule("placeholderAndEntities", placeholderAndEntities);
        bindModule("loading", loading);
        bindModule("entityLogic", entityLogic);
        bindModule("hebrewLetters", hebrewLetters);
        bindModule("heesHawvoos", heesHawvoos);
        bindModule("canvasSetup", canvasSetup);
        bindModule("ohr", ohr);
        bindModule("helpers", helpers);
        bindModule("transforms", transforms); // B"H: Bind transforms
        bindModule("sealayk", sealayk);
        
        console.log("B\"H - All Olam Methods Bound Successfully.");
        
    } catch(e) {
        console.error("B\"H - CRITICAL: Failed during method binding.", e);
        throw e;
    }
}