/**
 * B"H
 * @class State
 * @description Runtime memory vessel for Ohr HaGnuz.
 *
 * Chapter 207: Memory learned the language of giving. The Awtsmoos creates the
 * world from ayin every instant, yet the finite traveler must remember what is
 * still in the house, what was given, which declaration lines awakened, and
 * whether joy was shared. This is the new heart of the game.
 */
export class State {
  static ActiveRealm = 'OVERWORLD';
  static MapId = 'Overworld_Main';
  static Resolution = 64;
  static Speed = 3.35;
  static FrameDeltaScale = 1;
  static Hero = { cx: 12, cy: 7, dx: 12 * 64, dy: 7 * 64, dir: 'd', moving: false, stepTick: 0 };
  static Stats = { light: 100, maxLight: 100, level: 1, sparks: 0, debatesWon: 0, exp: 0, nextExp: 50 };
  static Sefiros = { chochmah: 0, binah: 0, daat: 0 };
  static Equipment = { garment: 'WHITE_LINEN' };
  static Inventory = { money: 0, garments: ['WHITE_LINEN'], books: [], journal: { opened: true, notes: [] }, items: { spark: 0, scroll: 0, chest: 0, key: 0, book: 0, mitzvah: 0, tea: 0, ink: 0, balm: 0 } };
  static Gifts = { inventory: {}, given: {}, blessingRemembered: false, joyShared: false, declaration: { unlocked: [], total: 6 }, history: [] };
  static TorahKnowledge = { booksRead: 0, power: 0, stats: { chochmah: 0, binah: 0, daat: 0 } };
  static TorahCodex = { routes: {}, quotes: {}, fusions: {}, affinity: { Mishnah: 0, Chassidus: 0, Kabbalah: 0, Niggun: 0 } };
  static Skills = {};
  static LearnedRoutes = { 'Mishnah Clarity': 1, 'Chassidus Warmth': 1, 'Kabbalah Light': 1, 'Niggun Joy': 1 };
  static MusagDex = { found: {}, mastery: {}, species: {}, evolutions: {} };
  static Quests = { active: { first_light: { started: true, act: 1 } }, completed: {}, counters: { spark: 0, scroll: 0, debateWon: 0, wildWon: 0, chest: 0, key: 0, book: 0, mitzvah: 0 } };
  static HeroPath = [];
  static PathTarget = null;
  static UiPanel = null;
  static VisitedMaps = { Overworld_Main: true };
  static Story = { beats: {}, active: 'First Light', chapter: 1 };
  static Dialogue = { open: false, glyph: null, label: '', lines: [], index: 0, questId: null, mode: 'intro' };
  static Message = 'Act 1: First Light. Talk to ג, then walk east to the Garden of Ungiven Things.';
  static MessageTTL = 1200;
  static BattleFx = [];

  static Debate = {
    enemy: null, enemyLight: 0, enemyMaxLight: 0, cursor: 0, choice: null, lastMove: null,
    rank: null, status: { player: {}, enemy: {} }, turn: 0, fxShake: 0,
    phase: 'choice', phaseTTL: 0, pendingEnemy: null, pendingReward: null, rewardText: '', banner: '',
    log: ['No debate is active.'],
    moves: [
      { name: 'Mishnah Clarity', category: 'Mishnah', power: 18, text: 'You clarify the case with precise Mishnah.' },
      { name: 'Chassidus Warmth', category: 'Chassidus', power: 14, text: 'You reveal the inner spark behind the question.' },
      { name: 'Kabbalah Light', category: 'Kabbalah', power: 24, text: 'You draw a higher pattern into the argument.' },
      { name: 'Niggun Joy', category: 'Niggun', power: 10, heal: 10, text: 'A niggun sweetens the dinim and restores light.' }
    ]
  };

  static Test = { visible: true, lastAction: 'Ready', presets: {
    door: { map: 'Overworld_Main', start: { x: 4, y: 6 }, target: { x: 5, y: 5 } },
    forest: { map: 'Overworld_Main', start: { x: 13, y: 2 }, target: { x: 13, y: 0 } },
    trainer: { map: 'Overworld_Main', start: { x: 22, y: 12 }, target: { x: 25, y: 12 } },
    grass: { map: 'Forest_North', start: { x: 10, y: 8 }, target: { x: 16, y: 8 } },
    market: { map: 'River_East', start: { x: 3, y: 5 }, target: { x: 27, y: 5 } },
    orchard: { map: 'Market_West', start: { x: 3, y: 6 }, target: { x: 27, y: 6 } },
    quest: { map: 'Overworld_Main', start: { x: 10, y: 2 }, target: { x: 2, y: 2 } },
    gifts: { map: 'Rambam_Garden', start: { x: 2, y: 5 }, target: { x: 2, y: 2 } },
    declaration: { map: 'House_Of_Forgetting', start: { x: 2, y: 6 }, target: { x: 13, y: 6 } },
    skills: { map: 'Chamber_Eit', start: { x: 6, y: 2 }, target: { x: 7, y: 2 } }
  } };

  static setFrameDeltaScale(scale = 1) { this.FrameDeltaScale = Math.max(0.5, Math.min(1.6, Number(scale) || 1)); }
  static isUiBlocking() { return !!this.UiPanel || !!this.Dialogue.open; }
  static clearPath() { this.HeroPath = []; this.PathTarget = null; }
  static resetHero(x, y, dir = 'd') { const r = this.Resolution; this.Hero = { cx: x, cy: y, dx: x * r, dy: y * r, dir, moving: false, stepTick: 0 }; this.clearPath(); this.rememberMap(this.MapId); }
  static rememberMap(mapId) { if (mapId) this.VisitedMaps[mapId] = true; }
  static openPanel(panel) { this.UiPanel = this.UiPanel === panel ? null : panel; if (this.UiPanel) this.closeDialogue(false); this.clearPath(); this.releaseIntents(); if (panel && this.UiPanel) this.say(`${panel[0].toUpperCase()}${panel.slice(1)} opened.`, 90); }
  static openDialogue({ glyph, label, lines, questId = null, index = 0, mode = 'intro' }) { this.UiPanel = null; this.clearPath(); this.releaseIntents(); this.Dialogue = { open: true, glyph, label, lines: lines || [], index, questId, mode }; this.say(`${label || 'Guide'}: ${this.Dialogue.lines[this.Dialogue.index] || ''}`, 900); }
  static closeDialogue(speak = true) { if (!this.Dialogue.open) return; this.Dialogue = { open: false, glyph: null, label: '', lines: [], index: 0, questId: null, mode: 'intro' }; this.releaseIntents(); if (speak) this.say('Dialogue closed. Use Journal to track the next step.', 180); }
  static dialogueNext(delta = 1) { if (!this.Dialogue.open) return; const max = Math.max(0, this.Dialogue.lines.length - 1); this.Dialogue.index = Math.max(0, Math.min(max, this.Dialogue.index + delta)); this.say(`${this.Dialogue.label}: ${this.Dialogue.lines[this.Dialogue.index] || ''}`, 900); }
  static nextStoryBeat(key, total) { const current = this.Story.beats[key] || 0; this.Story.beats[key] = Math.min(current + 1, total); return Math.min(current, Math.max(0, total - 1)); }
  static say(message, ttl = 360) { this.Message = message; this.MessageTTL = ttl; }
  static releaseIntents() { const w = typeof window === 'undefined' ? globalThis : window; ['U','D','L','R','A','B'].forEach(k => { if (w.AwtsmoosIntents) w.AwtsmoosIntents[k] = 0; }); }
}

const targetWindow = typeof window === 'undefined' ? globalThis : window;
targetWindow.AwtsmoosIntents = targetWindow.AwtsmoosIntents || { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0 };
