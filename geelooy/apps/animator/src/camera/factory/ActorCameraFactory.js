// B"H
import { CameraRig } from '../core/CameraRig.js';

/**
 * @file ActorCameraFactory.js
 * @description
 * Creates default face, body, and tracking cameras for each main actor.
 */
export class ActorCameraFactory {
  /**
   * Creates actor cameras.
   *
   * @param {Object} actors - Actor map.
   * @returns {Array<CameraRig>} Rigs.
   */
  static createForActors(actors = {}) {
    return Object.values(actors).flatMap(actor => this.forActor(actor));
  }

  /**
   * Creates cameras for one actor.
   *
   * @param {Object} actor - Actor.
   * @returns {Array<CameraRig>} Rigs.
   */
  static forActor(actor = {}) {
    const id = actor.id;
    const x = Number(actor.position?.x || 0);

    return [
      new CameraRig({
        id: `${id}_face`,
        name: `${actor.name || id} Face Close`,
        type: 'closeUp',
        targetMode: 'actor',
        targetActors: [id],
        x,
        y: -138,
        zoom: 0.82,
        framing: 'face',
        composition: 'ruleOfThirds',
        transition: 'ease',
        renderDetailMode: 'closeup'
      }),
      new CameraRig({
        id: `${id}_body`,
        name: `${actor.name || id} Body Medium`,
        type: 'medium',
        targetMode: 'actor',
        targetActors: [id],
        x,
        y: -126,
        zoom: 0.7,
        framing: 'body',
        transition: 'ease',
        renderDetailMode: 'medium'
      }),
      new CameraRig({
        id: `${id}_tracking`,
        name: `${actor.name || id} Tracking`,
        type: 'tracking',
        targetMode: 'actor',
        targetActors: [id],
        x,
        y: -126,
        zoom: 0.66,
        movement: 'sideTracking',
        transition: 'ease',
        renderDetailMode: 'medium'
      })
    ];
  }
}