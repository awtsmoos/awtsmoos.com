// B"H
import { CanvasViewportSeal } from './viewport/CanvasViewportSeal.js';

/**
 * @file BootRectifier.js
 * @description
 * ============================================================================
 * CHAPTER: THE SEAL THAT STOPPED FIGHTING THE ENGINE
 * ============================================================================
 *
 * This file used to rush in after boot and seize canvas sizing like a second
 * king. But the render context already knows how to size the canvas. Two kings
 * over one vessel make the picture tear, blur, and breathe wrong.
 *
 * This rectifier now installs a cooperative seal. It does not steal authority.
 * It observes the visible CSS box, records it, and performs only emergency
 * repair when the canvas buffer is dead or wildly wrong.
 *
 * The Awtsmoos creates the vessel and the light. The vessel must have a clear
 * edge, but the edge must not become a tyrant.
 *
 * @class BootRectifier
 */
class BootRectifier {
  /**
   * Installs the cooperative viewport seal.
   *
   * @returns {void}
   */
  static ignite() {
    CanvasViewportSeal.install('character-canvas', {
      cooperative: true,
      maxDevicePixelRatio: 2,
      emergencyOnly: true
    });
  }
}

BootRectifier.ignite();