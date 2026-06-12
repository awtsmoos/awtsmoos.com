// B"H
import { DOMElements } from '../../dom.js';
import { reportModalHealth } from '../modalHealth.js';

globalThis.window = globalThis;
DOMElements.modalRoot = {};
DOMElements.modalForm = {};
DOMElements.modalBackdrop = {};
DOMElements.modalTitleInput = {};

const report = reportModalHealth();
if (!report.ok) throw new Error('modal health should pass from DOMElements registry');
console.log('B"H modalHealth.test passed');
