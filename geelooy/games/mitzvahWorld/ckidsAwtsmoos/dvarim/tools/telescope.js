//B"H
import Tool from "../tool.js";
export default class Telescope extends Tool {
    async shoot() { this.olam.ayin.camera.fov = 20; this.olam.ayin.camera.updateProjectionMatrix(); }
}