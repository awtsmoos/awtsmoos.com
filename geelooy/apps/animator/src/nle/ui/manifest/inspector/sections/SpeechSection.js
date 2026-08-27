// B"H
import { SaveUtils } from '../utils/SaveUtils.js';

export class SpeechSection {
  static render(event, state, app) {
    return {
      tag: 'div',
      attr: { className: 'manifest-speech-section' },
      children: [
        { tag: 'label', attr: { className: 'manifest-field-label' }, children: 'SPEECH TEXT' },
        {
          tag: 'textarea',
          attr: { className: 'manifest-textarea manifest-speech-textarea' },
          children: event.speech || '',
          events: { input: e => { event.speech = e.target.value; SaveUtils.resave(event, state, app); } }
        }
      ]
    };
  }
}
