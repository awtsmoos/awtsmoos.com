
/* B”H */

/**
 * @class SequenceParser
 * @description
 * The 'Binah' (Understanding). 
 * Translates a raw array of events into a multi-track structure optimized 
 * for the NLE's visual representation.
 */
export class SequenceParser {
  static toTracks(events) {
    const tracks = {
      CAMERA: [],
      ACTORS: [],
      PROPS: [],
      SPEECH: []
    };

    events.forEach(e => {
      if (e.speech) tracks.SPEECH.push(e);
      else if (e.type === 'camera') tracks.CAMERA.push(e);
      else if (e.type === 'prop') tracks.PROPS.push(e);
      else if (e.type === 'character') tracks.ACTORS.push(e);
    });

    return tracks;
  }
}
