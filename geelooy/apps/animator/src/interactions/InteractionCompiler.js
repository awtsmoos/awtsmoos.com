// B"H
import { HandOffInteraction } from './HandOffInteraction.js';
import { BiteInteraction } from './BiteInteraction.js';
import { LookReactInteraction } from './LookReactInteraction.js';
export class InteractionCompiler {
  static compile(beat = {}) {
    const i = beat.interaction;
    if (!i) return [];
    if (i.type === 'handoff') return HandOffInteraction.events({ ...i, start: beat.start, end: beat.end });
    if (i.type === 'bite') return BiteInteraction.events({ ...i, start: beat.start, end: beat.end });
    if (i.type === 'lookReact') return LookReactInteraction.events({ ...i, start: beat.start, end: beat.end });
    return [];
  }
}
