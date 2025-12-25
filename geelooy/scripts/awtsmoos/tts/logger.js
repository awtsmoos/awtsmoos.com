// B"H
/**
 * @file logger.js
 * @description 
 * B"H
 * Records the creative events. Now features initial greeting for the logs.
 * The Awtsmoos, the Source of all Information, records every spark of creation.
 */

import { shoutError } from './ui.js';

/**
 * Records a message into the UI log container.
 * 
 * @param {string|Error} msg - The message or error to record.
 * @param {string} type - The nature of the event (info, success, warning, error).
 */
export const log = (msg, type = 'info') => {
  const logsContainer = document.getElementById('logs');
  
  const time = new Date().toLocaleTimeString();
  let messageText = String(msg);

  if (type === 'error') {
      const errorObj = msg instanceof Error ? msg : new Error(String(msg));
      messageText = errorObj.message;
      // B"H - Critical failures are broadcast via the Aura of Judgement.
      shoutError(messageText, errorObj);
  }

  if (logsContainer) {
      const div = document.createElement('div');
      // B"H - Using semantic classes for the new Forge Engine CSS
      div.className = `log-entry ${type}`;
      div.innerHTML = `<span class="timestamp">[${time}]</span> <span>${messageText}</span>`;
      logsContainer.prepend(div);
  } else {
      /**
       * B"H Fallback
       * Only used if the UI itself hasn't manifested yet.
       */
      const consoleMsg = `B"H LOG: [${type}] ${messageText}`;
      if (type === 'error') console.error(consoleMsg);
      else console.info(consoleMsg);
  }
};