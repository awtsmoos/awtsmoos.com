// B"H
/** @module SceneProperties @description Core scene vessels through the ThreeAdapter seam. */
import { Scene, Group } from '../rendering/ThreeAdapter.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
export const getSceneProperties = () => ({ scene:new Scene(), nivrayimGroup:new Group(), ohros:[], enlightened:false, objectsInScene:[] });
export default getSceneProperties;
