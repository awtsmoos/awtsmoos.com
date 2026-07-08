/*
    B"H
    Pawnim means "face"

    
*/
import Peh from "./peh/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default class Pawnim {
    constructor(nivra) {
        this.nivra = nivra;
        this.peh = new Peh(nivra);
    }

    
}