// B"H
import { TrackFactoryRouter } from './manifest/tracks/TrackFactoryRouter.js';

/**
 * @class ClipRenderer
 * @description
 * THE DELEGATE OF SPARKS.
 * The bloat has been excised. We now route all calls straight to the specialized factories.
 */
export class ClipRenderer {
  static render(event, core, trackType) {
    return TrackFactoryRouter.render(event, core, trackType);
  }
}