// B"H
/**
 * @module OlamInit
 * @description
 * Chapter 5: Quiet loader ignition.
 *
 * This tiny bridge imports the fresh loader initializer with a cache key so the
 * browser receives the no-warning GLTF setup on the next Level 1 boot.
 */
import initLogic from "../init.js?v=lean-l1-20260528-bh8";

export default class OlamInit {
  /** Runs the loader initialization. */
  static async execute(olam) {
    await initLogic(olam);
  }
}
