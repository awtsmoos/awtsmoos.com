// B"H
import { CharacterRig } from './CharacterRig.js';
export class CharacterAssembler { static human(id, options = {}) { return new CharacterRig({ id, ...options }); } }
