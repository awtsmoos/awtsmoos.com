// B"H
import { TorsoBuilder } from '../builders/TorsoBuilder.js';

/**
 * BodyBuilder keeps the older character-core import alive while routing its
 * vessel into the newer torso module, where garment geometry is actually born.
 */
export class BodyBuilder {
  static build(data) {
    return TorsoBuilder.build(data);
  }
}
