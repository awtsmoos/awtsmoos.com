//B"H
import Tool from "../tool.js";
export default class Blueprint extends Tool {
    constructor(op) { super(op); this.isBuildable = true; this.golem = op.itemData.golem; }
}