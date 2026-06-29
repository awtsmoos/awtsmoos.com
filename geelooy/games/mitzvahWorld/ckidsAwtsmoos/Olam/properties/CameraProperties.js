// B"H
/**
 * @module CameraProperties
 * The eyes of the world receive vectors through the adapter, not the raw path.
 */
import { Vector3 } from '../rendering/ThreeAdapter.js';
export const getCameraProperties = () => ({ aynaweem:[], ayinRotation:0, ayinPosition:new Vector3(), cameraObjectDirection:new Vector3() });
export default getCameraProperties;
