// B"H
export class LipSyncSystem {
  static getMouthOpen(isTalking, time) {
    if (!isTalking) return 0;
    // B"H - Intricate multi-frequency speech pattern simulating actual vowels and consonants
    const freq1 = Math.abs(Math.sin(time * 0.012));
    const freq2 = Math.abs(Math.cos(time * 0.017));
    const freq3 = Math.abs(Math.sin(time * 0.007));
    
    // Sometimes the mouth opens wide (Ah/Oh), sometimes narrow (Ee/Ih)
    return 0.1 + (freq1 * 0.4) + (freq2 * 0.2) + (freq3 * 0.3);
  }
}
