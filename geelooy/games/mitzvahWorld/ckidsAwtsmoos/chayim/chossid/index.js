//B"H
import Medabeir from "../medabeir/index.js";

/**
 * CHOSSID
 * An entity that represents a pious individual, characterized by joy and service.
 * Refined to extend the Medabeir archetype for full interaction capability.
 */
export default class Chossid extends Medabeir {
    constructor(options, olam) {
        super(options, olam);
        this.type = "chossid";
    }
    
    dance() {
        this.playChaweeyoos("dance silly");
        console.log('B"H - The Chossid is dancing with joy!');
    }
}
