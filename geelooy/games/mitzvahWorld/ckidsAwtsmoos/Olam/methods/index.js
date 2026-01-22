/**
 * B"H
 * Olam Methods Aggregator
 */
import loading from "./loading.js"
import entityLogic from "./entityLogic.js";
import hebrewLetters from "./hebrewLetters.js"
import heesHawvoos from "./heesHawvoos.js";
import canvasSetup from "./canvasSetup.js";
import ohr from "./ohr.js";
import boyrayNivra from "./boyrayNivra.js";
import helpers from "./helpers.js"
import loadNivrayim from "./loadNivrayim.js";
import tzimtzum from "./tzimtzum.js";
import placeholderAndEntities from "./placeholderAndEntities.js";
import hoyseef from "./hoyseef.js";
import sealayk from "./sealayk.js"
import properties from "./properties.js";

// B"H: Spatial and UI helpers
import transforms from "./helpers/transforms.js";
import htmlHelpers from "./helpers/htmlHelpers.js";

export default async function() {
    /**
     * classTransfer - Merges the prototypes of functional classes into the Olam essence.
     */
    var classTransfer = (classDef) => {
        if (!classDef || !classDef.prototype) return;
        Object.getOwnPropertyNames(classDef.prototype)
            .forEach(w => {
                if(w != "constructor") {
                    this[w] = classDef.prototype[w]?.bind(this);
                }
            });
    }

    /**
     * objectTransfer - Binds a collection of helper functions to the Olam vessel.
     */
    var objectTransfer = (obj) => {
        if (!obj) return;
        Object.entries(obj).forEach(([key, val]) => {
            if (typeof val === 'function') {
                this[key] = val.bind(this);
            } else {
                this[key] = val;
            }
        });
    }

    // B"H: Manifesting Faculties
    classTransfer(hoyseef);
    classTransfer(boyrayNivra);
    classTransfer(loadNivrayim);
    classTransfer(tzimtzum);
    classTransfer(placeholderAndEntities);
    classTransfer(loading);
    classTransfer(entityLogic);
    classTransfer(hebrewLetters);
    classTransfer(heesHawvoos);
    classTransfer(canvasSetup);
    classTransfer(ohr);
    classTransfer(helpers);
    classTransfer(sealayk);

    // B"H: Binding Spatial and UI Helpers
    objectTransfer(transforms);
    objectTransfer(htmlHelpers);

    /**
     * Manifest properties by synthesizing a new instance
     */
    var inst = new properties();
    Object.getOwnPropertyNames(inst)
    .forEach(w => {
        this[w] = inst[w];
    });
}
