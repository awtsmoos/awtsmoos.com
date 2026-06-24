/**
 * B"H
 * @class HolyEngine
 * @description Runtime loop for mobile RPG play with persistence hydration.
 *
 * Chapter 403: The first frame found an old footprint in the dust. The
 * Awtsmoos creates all from nothing every instant, yet kindness lets a player
 * return to the same village with the same sparks, garments, gifts, and maps.
 */
import { Projector } from '../tiferet/Projector.js';
import { MobileControls } from '../tiferet/ui/MobileControls.js';
import { Logic } from '../yesod/Logic.js';
import { Input } from '../yesod/Input.js';
import { State } from '../binah/State.js';
import { autosaveGame, clearSave, exportSave, importSave, loadGame, saveGame } from '../yesod/save/SaveRuntime.js';

export class HolyEngine {
  static visualKey = '';
  static lastDraw = 0;
  static lastPulse = 0;
  static maxIdleFps = 8;
  static bootDraws = 0;
  static started = false;
  static saveReady = false;

  static ignite() {
    if (this.started) return;
    this.started = true;
    console.log('B"H - HolyEngine igniting...');
    this.hydrateSave();
    Projector.warmup();
    MobileControls.mount();
    Input.bind();
    State.Message ||= 'B"H - Talk to ג. Tap NPC to face; press Talk for dialogue.';
    State.MessageTTL = Math.max(State.MessageTTL || 0, 600);
    this.visualKey = '';
    this.safeProject('ignite-immediate');
    this.queueBootDraws();
    const pulse = time => {
      const now = time || performance.now();
      this.measureTime(now);
      Logic.process();
      this.autosave(now);
      this.drawIfNeeded(now);
      MobileControls.update();
      requestAnimationFrame(pulse);
    };
    requestAnimationFrame(pulse);
  }

  static hydrateSave() {
    this.installSaveConsole();
    const loaded = loadGame();
    this.saveReady = loaded.ok || loaded.reason === 'empty';
    if (loaded.ok) State.say(`Save restored from ${loaded.envelope.savedAt}.`, 420);
    else if (loaded.reason === 'corrupt-json') State.say('Save file was corrupt; new journey state kept.', 600);
    globalThis.__OHR_HAGNUZ_SAVE_STATUS__ = loaded;
  }

  static installSaveConsole() {
    const api = { saveGame, loadGame, clearSave, exportSave, importSave };
    globalThis.OhrHaGnuzSave = api;
    if (typeof window !== 'undefined') window.OhrHaGnuzSave = api;
  }

  static autosave(time) {
    if (!this.saveReady) return;
    const result = autosaveGame(undefined, 2500);
    if (result.ok) globalThis.__OHR_HAGNUZ_LAST_AUTOSAVE__ = { at: time, savedAt: result.envelope.savedAt };
  }

  static queueBootDraws() {
    const draw = reason => () => this.safeProject(reason);
    requestAnimationFrame(draw('boot-raf-1'));
    requestAnimationFrame(() => requestAnimationFrame(draw('boot-raf-2')));
    [80, 240, 700].forEach(ms => setTimeout(draw(`boot-timeout-${ms}`), ms));
  }

  static safeProject(reason = 'project') {
    try {
      Projector.project();
      this.bootDraws += 1;
      this.visualKey = this.makeVisualKey();
      this.lastDraw = performance.now();
      globalThis.__OHR_HAGNUZ_LAST_PROJECT__ = { reason, at: this.lastDraw, count: this.bootDraws };
    } catch (error) {
      console.error('B"H - HolyEngine projection failed:', reason, error);
      globalThis.__OHR_HAGNUZ_RENDER_ERROR__ = `${reason}: ${error?.stack || error}`;
    }
  }

  static measureTime(time) {
    if (!this.lastPulse) { this.lastPulse = time; State.setFrameDeltaScale(1); return; }
    const delta = Math.max(8, Math.min(34, time - this.lastPulse));
    this.lastPulse = time;
    State.setFrameDeltaScale(delta / 16.6667);
  }

  static drawIfNeeded(time) {
    const key = this.makeVisualKey();
    const idleDue = time - this.lastDraw > 1000 / this.maxIdleFps;
    const needsStatic = !Projector.staticKey;
    const activeBattle = State.ActiveRealm === 'DEBATE';
    if (key !== this.visualKey || State.Hero.moving || activeBattle || idleDue || needsStatic) this.safeProject(needsStatic ? 'static-empty' : 'visual-change');
  }

  static makeVisualKey() {
    const h = State.Hero;
    const d = State.Dialogue;
    return [State.ActiveRealm, State.MapId, h.cx, h.cy, Math.round(h.dx * 10) / 10, Math.round(h.dy * 10) / 10,
      h.dir, h.moving ? 1 : 0, Math.round(h.stepTick * 10) / 10, State.PathTarget?.x ?? '', State.PathTarget?.y ?? '',
      State.PathTarget?.valid ?? '', State.PathTarget?.faceOnly ?? '', State.HeroPath.length, State.Message,
      State.MessageTTL > 0 ? 1 : 0, State.Stats.light, State.Stats.sparks, State.Stats.level, State.UiPanel || '',
      d.open ? 1 : 0, d.glyph || '', d.index || 0, d.lines?.length || 0].join('|');
  }
}
