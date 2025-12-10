
/**
 * B"H
 * Nature Tool - Plants grass or rocks
 */
import Tool from "../tool.js";

export default class NatureTool extends Tool {
    static itemName = "Nature Bag";
    static description = "Use to plant nature.";
    
    constructor(op) {
        super(op);
        this.natureType = op.natureType || 'grass'; // 'grass' or 'rock'
        this.isPainter = true; // Flag for continuous use
    }
}
