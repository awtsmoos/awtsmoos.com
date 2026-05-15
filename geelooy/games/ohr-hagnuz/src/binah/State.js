/**
 * B"H
 * @class State
 * @description Live state for the current Ohr HaBnuz runtime.
 */
export class State {
  static ActiveRealm = 'OVERWORLD';
  static MapId = 'Overworld_Main';
  static Resolution = 64;
  static Speed = 8;

  static Hero = { cx: 12, cy: 7, dx: 12 * 64, dy: 7 * 64, dir: 'd', moving: false, stepTick: 0 };

  static Stats = {
    light: 100,
    maxLight: 100,
    level: 1,
    sparks: 0,
    debatesWon: 0,
    exp: 0,
    nextExp: 50
  };

  static Sefiros = { chochmah: 0, binah: 0, daat: 0 };
  static Equipment = { garment: 'WHITE_LINEN' };
  static Inventory = { garments: ['WHITE_LINEN'], items: { spark: 0, scroll: 0, chest: 0, key: 0 } };

  static Skills = {};
  static MusagDex = { found: { }, mastery: { } };

  static Quests = { active: {}, completed: {}, counters: { spark: 0, scroll: 0, debateWon: 0, wildWon: 0, chest: 0, key: 0 } };

  static HeroPath = [];
  static PathTarget = null;
  static Message = 'Click a square to walk. Doors, quests, garments, and Torah debates respond.';
  static MessageTTL = 360;

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
      door: { map: 'Overworld_Main', start: {x:4, y:6}, target: {x:5, y:5} },
      forest: {map: 'Overworld_Main', start: {x:13, y:2}, target: {x:13, y:0} },
      trainer: { map: 'Overworld_Main', start: {x:22, y:12}, target: {x:25, y:12} },
      grass: {map: 'Forest_North', start: {x:10, y:8}, target: {x:16, y:8} },
      market: {map: 'River_East', start: {x:3, y:5}, target: {x:27, y:5} },
      orchard: {map: 'Market_West', start: {x:3, y:6}, target: {x:27, y:6} },
      quest: {map: 'Overworld_Main', start: {x:10, y:2}, target: {x:2, y:2} },
      skills: {map: 'Chamber_Eit', start: {x:6, y:2}, target: {x:7, y:2} }
    }
  };

  static resetHero(x, y, dir = 'd') {
    const r = this.Resolution;
    this.Hero.cx = x; this.Hero.cy = y;
    this.Hero.dx = x * r; this.Hero.dy = y * r;
    this.Hero.dir = dir;
    this.Hero.moving = false;
    this.Hero.stepTick = 0;
    this.HeroPath = [];
  }

  static say(message, ttl = 360) {
    this.Message = message;
    this.MessageTTL = ttl;
  }
}

window.AwtsmoosIntents = window.AwtsmoosIntents || { U:0, D:0, L:0, R:0, A:0, B:0 };
