/*
B"H
*/


import CollectableItem from "./collectableItem.js";

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