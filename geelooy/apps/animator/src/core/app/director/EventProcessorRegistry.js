// B"H
import { CharacterProcessor } from './logic/CharacterProcessor.js';
import { SpeechProcessor } from './logic/SpeechProcessor.js';
import { CameraProcessor } from './logic/CameraProcessor.js';
import { PropProcessor } from './logic/PropProcessor.js';

/**
 * @file EventProcessorRegistry.js
 * @description
 * Explicit processor map. No hidden switch. No mystery routing.
 */
export const EventProcessorRegistry = {
  character: CharacterProcessor,
  speech: SpeechProcessor,
  camera: CameraProcessor,
  prop: PropProcessor
};