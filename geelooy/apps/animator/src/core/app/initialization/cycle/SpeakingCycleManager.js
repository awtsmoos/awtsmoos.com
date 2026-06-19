
// B"H
/**
 * @file SpeakingCycleManager.js
 * @description
 * THE OBSERVER (Tzofeh).
 * An infinite loop that rotates the `isTalking` flag between active souls,
 * ensuring the universe remains dynamic even when the Director is paused.
 */
export class SpeakingCycleManager {
  static start(state) {
    let targetIndex = 0;
    
    setInterval(() => {
      const currentChars = state.get('characters');
      if (!currentChars) return;
      
      const soulIds = Object.keys(currentChars);
      if (soulIds.length === 0) return;

      Object.keys(currentChars).forEach(id => {
        currentChars[id].isTalking = false;
        currentChars[id].isDrinking = false;
      });

      targetIndex = (targetIndex + 1) % soulIds.length;
      const targetId = soulIds[targetIndex];
      const targetChar = currentChars[targetId];
      
      targetChar.isTalking = true;
      if (targetId === 'scholar') targetChar.isDrinking = true; 
      
      state.update('characters', currentChars);
    }, 4500);
  }
}
