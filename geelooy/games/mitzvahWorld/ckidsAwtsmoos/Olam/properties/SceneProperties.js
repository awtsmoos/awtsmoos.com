// B"H
/** @module SceneProperties @description Core scene vessels through the ThreeAdapter seam. */
import { Scene, Group } from '../rendering/ThreeAdapter.js';
export const getSceneProperties = () => ({ scene:new Scene(), nivrayimGroup:new Group(), ohros:[], enlightened:false, objectsInScene:[] });
export default getSceneProperties;
