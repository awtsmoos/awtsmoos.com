// B"H
/**
 * @file helpers.js
 * @description
 * Chapter 436: The helper bridge drinks the rooted loader seal.
 *
 * The Awtsmoos lets model loading, mesh generation, transforms, state, and HTML
 * bridges pass through this helper. The GLB loader branch now shares the same
 * visible-root seal as Chossid visibility and worker probes.
 */
import * as AWTSMOOS from '../../awtsmoosCkidsGames.js?v=visible-root-binding-20260610-bh710';
import Utils from '../../utils.js';
import ShlichusHandler from '../../shleechoosHandler.js';
import LoadersModule from './helpers/loaders/index.js?v=visible-root-binding-20260610-bh710';
import generateThreeJsMesh from './helpers/generateMesh.js';
import TransformsModule from './helpers/transforms.js';
import StateModule from './helpers/state.js';

export default class HelpersBridge {
  async loadGLTF(url) { return await LoadersModule.loadGLTF.call(this, url); }
  async loadTexture(options) { return await LoadersModule.loadTexture.call(this, options); }
  async generateThreeJsMesh(golem) { return await generateThreeJsMesh(golem, this); }
  getForwardVector() { return TransformsModule.getForwardVector.call(this); }
  getSideVector() { return TransformsModule.getSideVector.call(this); }
  refreshCameraAspect() { return TransformsModule.refreshCameraAspect.call(this); }
  getTransformation(child) { return TransformsModule.getTransformation.call(this, child); }
  setMeshOnTop(s, t) { return TransformsModule.setMeshOnTop.call(this, s, t); }
  placePlaneOnTopOfBox(p, b) { return TransformsModule.placePlaneOnTopOfBox.call(this, p, b); }
  serialize() { return StateModule.serialize.call(this); }
  getCompiledNivrayimInfo() { return StateModule.getCompiledNivrayimInfo.call(this); }
  getGameState() { return StateModule.getGameState.call(this); }
  setGameState(state) { return StateModule.setGameState.call(this, state); }
  startShlichusHandler() { this.shlichusHandler = new ShlichusHandler(this); }
  async fetchGetSize(url) { return await Utils.fetchGetSize(url); }
  async fetchWithProgress(url, options = {}, otherOptions) { return await Utils.fetchWithProgress(url, options, otherOptions); }
  go(ob, id = this.official) { return Utils.go(ob, id); }
  callMethods(baseObj, methods) { return Utils.callMethods(baseObj, methods); }
  async getIconFromType(type) {
    let icon;
    if (type && typeof type === 'string') {
      const collectableItem = AWTSMOOS[type];
      if (collectableItem?.iconId) icon = collectableItem.iconId;
    }
    if (typeof icon !== 'string') return null;
    try { return (await import('../../../icons/items/' + icon + '.js'))?.default || null; }
    catch { return null; }
  }
  async htmlActions(ar) { return await this.ayshPeula('htmlActions', ar); }
  async htmlAction(shaym, properties, methods, selector) {
    if (typeof shaym === 'object') {
      properties = shaym.properties;
      methods = shaym.methods;
      selector = shaym.selector;
      shaym = shaym.shaym;
    }
    return await this.ayshPeula('htmlAction', { shaym, properties, methods, selector });
  }
  async heescheel() { this.isHeesHawvoos = true; }
}
