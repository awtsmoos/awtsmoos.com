// B"H
/**
 * @file loadNivrayim.js
 * @description Critical-first nivra loader. First playable receives the real
 * ground, light, camera, control shell, and collision truth; farther abundance
 * streams after playable through a frame-budgeted queue instead of being cut.
 */
import Utils from '../../utils.js';
import * as AWTSMOOS from '../../awtsmoosCkidsGames.js?v=no-compact-engine-20260702-bh2';
import { createBootMarks } from '../boot/BootPerformanceMarks.js';
import { createDeferredBootQueue } from '../boot/DeferredBootQueue.js';
import { splitBootEntries, bootBudgetSummary } from '../boot/CriticalBootPlan.js';

function normalizeEntries(nivrayim = {}) {
  const entries = [];
  for (const [type, nivraOptions] of Object.entries(nivrayim || {})) {
    const raw = Array.isArray(nivraOptions) ? nivraOptions : Object.entries(nivraOptions || {});
    for (const entry of raw) {
      const isArrayEntry = !Array.isArray(entry);
      entries.push({ type, name: isArrayEntry ? entry.name : entry[0], options: isArrayEntry ? entry : entry[1] });
    }
  }
  return entries;
}

export default class LegacyLoadNivrayim {
  async addObject(type, options = {}) {
    const Ctor = AWTSMOOS[type];
    if (!Ctor) {
      console.error(`B"H - Olam.addObject: Type "${type}" does not exist.`, { available: Object.keys(AWTSMOOS) });
      return null;
    }
    const nivra = new Ctor(options, this);
    await this.prepareBatchForWorld([nivra]);
    return nivra;
  }

  async instantiateNivra(entry) {
    const Ctor = AWTSMOOS[entry.type];
    if (!Ctor || typeof Ctor !== 'function') {
      console.warn('B"H | LEGACY_INSTANTIATE_MISSING_TYPE', { type: entry.type, available: Object.keys(AWTSMOOS) });
      return null;
    }
    const evaledObject = Utils.evalStringifiedFunctions(entry.options || {});
    const nivra = new Ctor({ name: entry.name, ...evaledObject }, this);
    nivra.olam = this;
    return nivra;
  }

  async instantiateBatch(entries) {
    const made = [];
    for (const entry of entries) {
      try {
        const nivra = await this.instantiateNivra(entry);
        if (nivra) made.push(nivra);
      } catch (error) {
        console.error('B"H - Error instantiating legacy nivra', entry, error);
      }
    }
    return made;
  }

  async prepareBatchForWorld(nivrayimMade) {
    for (const nivra of nivrayimMade) {
      nivra.olam = this;
      if (!this.nivrayim.includes(nivra)) this.nivrayim.push(nivra);
      nivra.assetSize = typeof nivra.getSize === 'function' ? await nivra.getSize() : 0;
    }
    for (const nivra of nivrayimMade) if (typeof nivra.heescheel === 'function') await nivra.heescheel(this, { nivrayimMade });
    for (const nivra of nivrayimMade) if (nivra.madeAll) await nivra.madeAll(this);
    for (const nivra of nivrayimMade) await this.doPlaceholderAndEntityLogic(nivra);
    for (const nivra of nivrayimMade) if (nivra.ready) await nivra.ready();
    for (const nivra of nivrayimMade) if (nivra.afterBriyah) await nivra.afterBriyah();
    return nivrayimMade;
  }

  hydrateDeferredEntries(entries, marks) {
    const queue = createDeferredBootQueue({ budgetMs: 6, label: 'nivrayim-post-playable' });
    this.__awtsDeferredHydrationQueue = queue;
    queue.addMany(entries, async entry => {
      const made = await this.instantiateBatch([entry]);
      await this.prepareBatchForWorld(made);
      marks.mark('deferred-nivra-hydrated', { type: entry.type, name: entry.name });
    });
    marks.mark('deferred-nivrayim-scheduled', { count: entries.length });
    queue.start();
  }

  async loadNivrayim(nivrayim) {
    const marks = createBootMarks('load-nivrayim');
    try {
      marks.mark('load-nivrayim-start');
      const entries = normalizeEntries(nivrayim);
      const { critical, deferred } = splitBootEntries(entries);
      this.__awtsLoadBudget = bootBudgetSummary(entries);
      globalThis.__AWTS_LOAD_BUDGET__ = this.__awtsLoadBudget;
      marks.mark('load-nivrayim-budget', this.__awtsLoadBudget);

      const nivrayimMade = await this.instantiateBatch(critical);
      await this.prepareBatchForWorld(nivrayimMade);
      this.totalSize = nivrayimMade.reduce((sum, nivra) => sum + (nivra.assetSize || 0), 0);
      if (deferred.length) this.hydrateDeferredEntries(deferred, marks);
      if (!this.enlightened && typeof this.ohr === 'function') this.ohr();
      marks.mark('load-nivrayim-critical-ready', { critical: nivrayimMade.length, deferred: deferred.length });
      return nivrayimMade || [];
    } catch (error) {
      console.error('B"H - LEGACY LOAD FAILED: ', error);
      marks.mark('load-nivrayim-failed', { message: String(error?.message || error) });
      return [];
    }
  }
}
