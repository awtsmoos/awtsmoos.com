// B"H
import { StageAnchorResolver } from './StageAnchorResolver.js';

/** Converts semantic staging into anchored coordinates. */
export class GroundingSolver {
  static groundCharacter(character = {}, scene = {}) {
    const pos = StageAnchorResolver.resolve(character.position || {}, scene);
    return { ...character, position: { ...character.position, ...pos, y: Math.max(pos.y, 185) } };
  }

  static groundAll(characters = {}, scene = {}) {
    return Object.fromEntries(Object.entries(characters).map(([id, c]) => [id, this.groundCharacter(c, scene)]));
  }
}
