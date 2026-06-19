// B"H
/**
 * @file MovieShotLibrary.js
 * @description Camera grammar for every generated scene shape.
 *
 * A shot is a small window cut into time. Wide, over-shoulder, orbit, push,
 * reveal, chase: the Awtsmoos lets each window open differently, while the data
 * stays simple enough for any world JSON to request a whole film.
 */
const KIND_GRAMMAR = Object.freeze({
  dialogue:["establish","overShoulder","reaction","pushIn"],
  quest:["establish","reveal","pushIn","hero"],
  battle:["wide","orbit","impact","recover"],
  travel:["crane","follow","vista","arrive"],
  learning:["establish","table","reaction","glow"],
  loot:["wide","detail","reaction","inventory"],
  discovery:["crane","reveal","orbit","hero"],
  default:["establish","pushIn","reaction","hero"]
});

const SHOT_OFFSETS = Object.freeze({
  establish:{ pos:[-7,4.8,9], look:[0,1.4,0], lens:35 },
  wide:{ pos:[-9,5.5,11], look:[0,1.3,0], lens:30 },
  crane:{ pos:[-12,9,15], look:[0,1.2,0], lens:28 },
  reveal:{ pos:[6,4.2,8], look:[0,1.8,0], lens:42 },
  pushIn:{ pos:[-3.8,2.9,5.8], look:[0,1.55,0], lens:55 },
  overShoulder:{ pos:[-1.8,2.2,3.4], look:[0,1.45,0], lens:65 },
  reaction:{ pos:[2.4,2.1,3.1], look:[0,1.5,0], lens:70 },
  orbit:{ pos:[5,3.5,5], look:[0,1.45,0], lens:45 },
  impact:{ pos:[1.3,1.8,2.4], look:[0,1.2,0], lens:75, shake:.18 },
  recover:{ pos:[-4,2.6,5], look:[0,1.45,0], lens:55 },
  follow:{ pos:[0,3.2,7.2], look:[0,1.4,0], lens:48 },
  vista:{ pos:[-10,7,13], look:[0,2,0], lens:32 },
  arrive:{ pos:[4,3,6], look:[0,1.4,0], lens:50 },
  table:{ pos:[-2.5,2.1,4], look:[0,.9,0], lens:62 },
  glow:{ pos:[0,2.3,4.8], look:[0,1.7,0], lens:58 },
  detail:{ pos:[.8,1.35,2.2], look:[0,.8,0], lens:85 },
  inventory:{ pos:[-2,2.1,3.5], look:[0,1.2,0], lens:60 },
  hero:{ pos:[3.8,3.1,5.6], look:[0,1.75,0], lens:50 }
});

/**
 * Adds two vectors represented as arrays.
 *
 * @param {number[]} a First vector.
 * @param {number[]} b Second vector.
 * @returns {number[]} Sum.
 */
function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }

/**
 * Returns shot names for a scene kind.
 *
 * @param {string} kind Scene kind.
 * @returns {string[]} Shot names.
 */
export function shotGrammarFor(kind = "default") { return KIND_GRAMMAR[kind] || KIND_GRAMMAR.default; }

/**
 * Creates one camera shot from grammar.
 *
 * @param {string} name Shot grammar name.
 * @param {number[]} center Scene center.
 * @param {number} at Start time.
 * @param {number} durationSec Duration.
 * @returns {object} Camera shot.
 */
export function movieShot(name, center = [0,0,0], at = 0, durationSec = 3) {
  const base = SHOT_OFFSETS[name] || SHOT_OFFSETS.establish;
  return { id:`${name}_${Math.round(at * 1000)}`, kind:"camera", shot:name, at, durationSec, pos:add(center, base.pos), look:add(center, base.look), lens:base.lens, shake:base.shake || 0 };
}

/**
 * Synthesizes camera beats for a whole scene.
 *
 * @param {object} scene Normalized scene.
 * @returns {object[]} Camera beats.
 */
export function synthesizeSceneShots(scene = {}) {
  const grammar = shotGrammarFor(scene.kind), center = scene.location?.position || [0,0,0], duration = Number(scene.durationSec || 18) || 18;
  const step = duration / Math.max(1, grammar.length);
  return grammar.map((name, index) => movieShot(name, center, index * step, step));
}

export default synthesizeSceneShots;
