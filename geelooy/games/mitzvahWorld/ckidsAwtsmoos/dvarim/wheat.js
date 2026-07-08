/*
B"H
*/


import CollectableItem from "./collectableItem.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class Wheat extends CollectableItem {
    static iconId = "wheat"
    
    // B"H: Value
    sellValue = 2;

    constructor(op) {
        super(op);
        this.placeholderName = "wheat";
        this.iconItem = Wheat.iconId;
    }
}