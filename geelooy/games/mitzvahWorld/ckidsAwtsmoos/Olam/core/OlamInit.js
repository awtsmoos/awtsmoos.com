// B"H
/**
 * @module OlamInit
 * @description
 * Chapter 323: The boot bridge burns the stale DRACO path.
 *
 * This imports the no-remote-DRACO initializer with a fresh cache key so mobile
 * reloads stop executing the old preload fatality.
 */
import initLogic from "../init.js?v=no-remote-draco-fetch-fatality-20260603-bh323";

export default class OlamInit {
  /** Runs the loader initialization. */
  static async execute(olam) {
    await initLogic(olam);
  }
}
