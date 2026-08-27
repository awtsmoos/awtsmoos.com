// B"H
import { SpeechTrackRenderer } from './renderers/SpeechTrackRenderer.js';
import { CameraTrackRenderer } from './renderers/CameraTrackRenderer.js';
import { MotionTrackRenderer } from './renderers/MotionTrackRenderer.js';
import { PropTrackRenderer } from './renderers/PropTrackRenderer.js';
import { SceneTrackRenderer } from './renderers/SceneTrackRenderer.js';

/**
 * @class TrackFactoryRouter
 * @description
 * THE SORTER OF LANES.
 * B"H
 * Uses a constant Map to route pure JSON rendering, entirely 
 * avoiding switch statements in accordance with Seder Histalshelus.
 */
export class TrackFactoryRouter {
  static getRenderer(eventType) {
    const routingMap = {
      'speech': SpeechTrackRenderer,
      'camera': CameraTrackRenderer,
      'character': MotionTrackRenderer,
      'action': MotionTrackRenderer,
      'prop': PropTrackRenderer,
      'scene_change': SceneTrackRenderer
    };

    return routingMap[eventType] || MotionTrackRenderer;
  }

  static render(event, core, trackType) {
    const RendererClass = this.getRenderer(event.type);
    return RendererClass.render(event, core, trackType);
  }
}