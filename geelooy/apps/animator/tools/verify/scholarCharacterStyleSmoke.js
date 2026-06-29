// B"H
import assert from 'node:assert/strict';
import { StableCharacterAssembler } from '../../src/character/factory/stable/StableCharacterAssembler.js';
<<<<<<< HEAD
import { SCHOLAR_CHARACTERS } from '../../src/data/scenes/default/scholarCharacters.js';

const node = StableCharacterAssembler.assemble(SCHOLAR_CHARACTERS.rabbi_right);
=======
import { GoalBoardEasyAPI } from '../../src/authoring/goalBoard/index.js';

const studyScene = GoalBoardEasyAPI.scene();
const node = StableCharacterAssembler.assemble(studyScene.initialCharacters.rabbi_right);
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
const text = JSON.stringify(node);
for (const word of ['stable_black_hat', 'stable_full_beard', 'stable_round_glasses', 'stable_suit_overlay']) assert.ok(text.includes(word), word);
console.log('B"H scholar character style smoke passed');
