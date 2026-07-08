// B"H
/**
 * @file helpers.js
 * @purpose Bridges Olam helper calls into loaders, transforms, state, HTML, and icons.
 * @owner Live mitzvahWorld Olam runtime and worker-visible vessel imports.
 * @inputs Runtime instance state, AWTSMOOS item classes, URLs, meshes, and UI requests.
 * @outputs Loader results, generated meshes, serialized state, HTML bridge calls, and SVG icons.
 * @runtimeAuthority Canonical helper authority for OlamVessel; no static directory imports.
 * @updateOrder Load after core utilities and before Nivra/worker systems call helper methods.
 * @callers ckidsAwtsmoos/Olam/core/OlamVessel.js and inherited Olam runtime methods.
 * @invariants Icon lookup uses explicit module imports so preflight never fetches directories.
 * @failureModes Missing item/icon IDs resolve to null rather than throwing during boot.
 */
import * as AWTSMOOS from '../../awtsmoosCkidsGames.js?compact=true&v=visible-root-binding-20260610-bh710';
import Utils from '../../utils.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import ShlichusHandler from '../../shleechoosHandler.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import LoadersModule from './helpers/loaders/index.js?compact=true&v=visible-root-binding-20260610-bh710';
import generateThreeJsMesh from './helpers/generateMesh.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import TransformsModule from './helpers/transforms.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import StateModule from './helpers/state.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';
import wheatIcon from '../../../icons/items/wheat.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1';

const itemIcons = { wheat: wheatIcon };

function iconForType(type) {
  if (!type || typeof type !== 'string') return null;
  const collectableItem = AWTSMOOS[type];
  const iconId = collectableItem?.iconId;
  return typeof iconId === 'string' ? itemIcons[iconId] || null : null;
}

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
  async fetchWithProgress(url, options = {}, otherOptions) {
    return await Utils.fetchWithProgress(url, options, otherOptions);
  }
  go(ob, id = this.official) { return Utils.go(ob, id); }
  callMethods(baseObj, methods) { return Utils.callMethods(baseObj, methods); }
  async getIconFromType(type) { return iconForType(type); }
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
