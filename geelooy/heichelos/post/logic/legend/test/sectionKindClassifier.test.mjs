// B"H
import { classifySectionKinds } from '../sectionKindClassifier.js';
const preset = { dataset: { awtsmoosKind: 'story' }, textContent: 'anything' };
const question = { dataset: {}, textContent: 'What is this?' };
globalThis.document = { querySelectorAll(){ return [preset, question]; } };
classifySectionKinds();
if (preset.dataset.awtsmoosKind !== 'story') throw new Error('preset kind overwritten');
if (question.dataset.awtsmoosKind !== 'question') throw new Error('question not classified');
console.log('B"H sectionKindClassifier.test passed');
