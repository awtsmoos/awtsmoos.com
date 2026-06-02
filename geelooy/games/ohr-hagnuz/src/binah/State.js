/**
 * B"H
 * @class State
 * @description Runtime memory vessel for Ohr HaGnuz.
 *
 * Chapter 120: The stride was restored. The Awtsmoos has no body and no form,
 * yet the player has a thumb, a phone, a road, a quest, and no patience for
 * molasses. This state keeps the world fast, countable, and responsive.
 */
export class State {
  static ActiveRealm = 'OVERWORLD';
  static MapId = 'Overworld_Main';
  static Resolution = 64;
  static Speed = 8;

  static Hero = { cx: 12, cy: 7, dx: 12 * 64, dy: 7 * 64, dir: 'd', moving: false, stepTick: 0 };
  static Stats = { light: 100, maxLight: 100, level: 1, sparks: 0, debatesWon: 0, exp: 0, nextExp: 50 };
  static Sefiros = { chochmah: 0, binah: 0, daat: 0 };
  static Equipment = { garment: 'WHITE_LINEN' };
  static Inventory = { garments: ['WHITE_LINEN'], items: { spark: 0, scroll: 0, chest: 0, key: 0, book: 0, mitzvah: 0 } };
  static Skills = {};
  static MusagDex = { found: {}, mastery: {} };
  static Quests = { active: {}, completed: {}, counters: { spark: 0, scroll: 0, debateWon: 0, wildWon: 0, chest: 0, key: 0, book: 0, mitzvah: 0 } };
  static HeroPath = [];
  static PathTarget = null;
  static UiPanel = null;
  static VisitedMaps = { Overworld_Main: true };
  static Story = { beats: {}, active: 'Village Guide', chapter: 1 };
  static Message = 'Talk to the Village Guide. NPCs give missions. Merchants trade.';
  static MessageTTL = 720;
  static BattleFx = [];

  static Debate = {
    enemy: null,
    enemyLight: 0,
    enemyMaxLight: 0,
    cursor: 0,
    log: ['No debate is active.'],
    moves: [
      { name: 'Mishnah Clarity', power: 18, text: 'You clarify the case with precise Mishnah.' },
      { name: 'Chassidus Warmth', power: 14, text: 'You reveal the inner spark behind the question.' },
      { name: 'Kabbalah Light', power: 24, text: 'You draw a higher pattern into the argument.' },
      { name: 'Niggun Joy', power: 10, heal: 10, text: 'A niggun sweetens the dinim and restores light.' }
    ]
  };

  static Test = {
    visible: true,
    lastAction: 'Ready',
    presets: {
      door: { map: 'Overworld_Main', start: { x: 4, y: 6 }, target: { x: 5, y: 5 } },
      forest: { map: 'Overworld_Main', start: { x: 13, y: 2 }, target: { x: 13, y: 0 } },
      trainer: { map: 'Overworld_Main', start: { x: 22, y: 12 }, target: { x: 25, y: 12 } },
      grass: { map: 'Forest_North', start: { x: 10, y: 8 }, target: { x: 16, y: 8 } },
      market: { map: 'River_East', start: { x: 3, y: 5 }, target: { x: 27, y: 5 } },
      orchard: { map: 'Market_West', start: { x: 3, y: 6 }, target: { x: 27, y: 6 } },
      quest: { map: 'Overworld_Main', start: { x: 10, y: 2 }, target: { x: 2, y: 2 } },
      skills: { map: 'Chamber_Eit', start: { x: 6, y: 2 }, target: { x: 7, y: 2 } }
    }
  };

  /** @param {number} x @param {number} y @param {'u'|'d'|'l'|'r'} dir @returns {void} */
  static resetHero(x, y, dir = 'd') {
    const r = this.Resolution;
    this.Hero = { cx: x, cy: y, dx: x * r, dy: y * r, dir, moving: false, stepTick: 0 };
    this.HeroPath = [];
    this.PathTarget = null;
    this.rememberMap(this.MapId);
  }

  /** @param {string} mapId @returns {void} */
  static rememberMap(mapId) {
    if (mapId) this.VisitedMaps[mapId] = true;
  }

  /** @param {string|null} panel @returns {void} */
  static openPanel(panel) {
    this.UiPanel = this.UiPanel === panel ? null : panel;
    if (panel) this.say(`${panel[0].toUpperCase()}${panel.slice(1)} opened.`, 90);
  }

  /** @param {string} key @param {number} total @returns {number} */
  static nextStoryBeat(key, total) {
    const current = this.Story.beats[key] || 0;
    this.Story.beats[key] = Math.min(current + 1, total);
    return Math.min(current, Math.max(0, total - 1));
  }

  /** @param {string} message @param {number} ttl @returns {void} */
  static say(message, ttl = 360) {
    this.Message = message;
    this.MessageTTL = ttl;
  }
}

const targetWindow = typeof window === 'undefined' ? globalThis : window;
targetWindow.AwtsmoosIntents = targetWindow.AwtsmoosIntents || { U: 0, D: 0, L: 0, R: 0, A: 0, B: 0 };
