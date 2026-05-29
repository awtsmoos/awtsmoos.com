// B"H
/**
 * @file loadNivrayim.js
 * @description Chapter 56: Legacy loader drinks the separated mover river.
 */
import Utils from '../../utils.js';
import * as AWTSMOOS from '../../awtsmoosCkidsGames.js?v=lean-l1-20260528-bh56';

export default class {
  async addObject(type, options) {
    if (!AWTSMOOS[type]) { console.error(`B"H - Olam.addObject: Type "${type}" does not exist.`); return null; }
    const nivra = new AWTSMOOS[type](options, this);
    let mesh;
    if (options.golem) {
      mesh = await this.generateThreeJsMesh(options.golem, this);
      mesh.name = nivra.name; nivra.mesh = mesh; mesh.nivraAwtsmoos = nivra; mesh.userData ||= {};
      if (options.position) mesh.position.copy(options.position);
      if (options.rotation) { const r = options.rotation; mesh.rotation.set(Number(r.x) || 0, Number(r.y) || 0, Number(r.z) || 0); }
      if (options.scale) mesh.scale.copy(options.scale);
      if (options.itemData) mesh.userData.itemData = options.itemData;
      if (options.isSolid) mesh.userData.isSolid = true;
      if (type === 'InteractiveNpc' || type === 'Chossid' || type === 'Medabeir' || type === 'CustomNpc') { mesh.userData.isLiving = true; mesh.userData.skipOctree = true; mesh.userData.noOctree = true; }
      mesh.updateMatrixWorld(true);
      let physicsSuccess = true;
      if (options.isSolid) { physicsSuccess = this.worldOctree.addObject(mesh); if (!physicsSuccess) { console.error(`B"H Error: Failed to add ${mesh.name} to Physics. Aborting.`); return null; } }
      if (physicsSuccess) {
        mesh.traverse(child => { if (child.isMesh) { child.userData ||= {}; if (options.itemData) child.userData.itemData = options.itemData; if (options.isSolid) child.userData.isSolid = true; child.nivraAwtsmoos = nivra; } });
        if (options.interactable && type !== 'CustomNpc' && type !== 'Chossid' && type !== 'Medabeir' && type !== 'InteractiveNpc') this.interactiveOctree.fromGraphNode(mesh);
        if (options.interactable && this.interactableNivrayim && !this.interactableNivrayim.includes(nivra)) this.interactableNivrayim.push(nivra);
        this.nivrayimGroup.add(mesh);
      }
    }
    this.nivrayim.push(nivra); await nivra.ready?.(); await nivra.afterBriyah?.(); return nivra;
  }

  async loadNivrayim(nivrayim) {
    try {
      const nivrayimMade = [];
      for (const [type, nivraOptions] of Object.entries(nivrayim || {})) {
        const isAr = Array.isArray(nivraOptions), ar = isAr ? nivraOptions : Object.entries(nivraOptions);
        for (const entry of ar) {
          const name = isAr ? entry.name : entry[0];
          const options = isAr ? entry : entry[1];
          try { const evaledObject = Utils.evalStringifiedFunctions(options); const Ctor = AWTSMOOS[type]; if (Ctor && typeof Ctor === "function") nivrayimMade.push(new Ctor({ name, ...evaledObject }, this)); }
          catch (error) { console.error("B\"H - Error instantiating legacy nivra", options, error); }
        }
      }
      let totalSize = 0;
      for (const nivra of nivrayimMade) { nivra.olam = this; const s = typeof nivra.getSize === 'function' ? await nivra.getSize() : 0; totalSize += s; nivra.size = s; }
      this.totalSize = totalSize;
      for (const nivra of nivrayimMade) if (typeof nivra.heescheel === "function") await nivra.heescheel(this, { nivrayimMade });
      for (const nivra of nivrayimMade) if (nivra.madeAll) await nivra.madeAll(this);
      for (const nivra of nivrayimMade) await this.doPlaceholderAndEntityLogic(nivra);
      for (const nivra of nivrayimMade) if (nivra.ready) await nivra.ready();
      for (const nivra of nivrayimMade) if (nivra.afterBriyah) await nivra.afterBriyah();
      if (!this.enlightened && typeof this.ohr === 'function') this.ohr();
      return nivrayimMade || [];
    } catch (error) { console.error("B\"H - LEGACY LOAD FAILED: ", error); return []; }
  }
}
