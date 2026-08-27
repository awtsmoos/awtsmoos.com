// B"H
import { AttentionTarget } from './AttentionTarget.js';
export class GazePlanner { static choose(character = {}, event = {}) { if (event.attentionTarget) return event.attentionTarget; if (event.lookAt) return AttentionTarget.make(event.lookAt, 'actor'); if (event.objectId || event.propId) return AttentionTarget.make(event.objectId || event.propId, 'prop'); return character.lookAt ? AttentionTarget.make(character.lookAt, 'actor') : null; } }
