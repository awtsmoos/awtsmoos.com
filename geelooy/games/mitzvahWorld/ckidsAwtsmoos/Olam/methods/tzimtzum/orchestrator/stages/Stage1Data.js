// B"H
/**
 * @module Stage1Data
 * @description
 * Chapter 3: The Blob gate is sealed.
 *
 * Level 1 must be driven only by the already-imported `worldDayuh` object from
 * the direct ladder module. This stage refuses `worldDayuhURL` entirely, so an
 * old menu/custom-world Blob script cannot merge enemy/NPC desert data into the
 * clean pipeline after the worker starts.
 */
import defaultConfig from "../../../../../defaultConfig.js";

export default class Stage1Data {
  /**
   * Merges system and user data without importing arbitrary world modules.
   *
   * @param {object} systemInfo Engine information.
   * @param {object} userInfo Direct world data and player state.
   * @returns {Promise<object>} Consolidated world information.
   */
  static async merge(systemInfo = {}, userInfo = {}) {
    const info = { ...systemInfo, ...userInfo };
    if (typeof info.worldDayuhURL === "string") {
      console.warn('B"H - worldDayuhURL ignored in clean Level 1 pipeline:', info.worldDayuhURL);
      delete info.worldDayuhURL;
    }

    if (defaultConfig?.components) {
      info.components = {
        ...defaultConfig.components,
        ...(info.components || {})
      };
    }

    if (!info.nivrayim) {
      console.warn('B"H - No nivrayim found. Generating empty void.');
      info.nivrayim = {};
    }

    return info;
  }
}
