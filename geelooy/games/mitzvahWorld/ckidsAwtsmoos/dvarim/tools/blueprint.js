//B"H
import Tool from "../tool.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
export default class Blueprint extends Tool {
    constructor(op) { super(op); this.isBuildable = true; this.golem = op.itemData.golem; }
}