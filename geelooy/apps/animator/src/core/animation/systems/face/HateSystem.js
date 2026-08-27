// B"H
export class HateSystem {
  static update(val, time) {
    // Hate boils up slowly but strongly, erupting chaotically.
    // It is a powerful wave of revulsion that peaks sharply and dissipates, with micro-spasms.
    const baseWave = Math.sin(time * 0.0008) * Math.cos(time * 0.0003); 
    const spasm = Math.sin(time * 0.02) * 0.15; // twitch of the brow/lips

    if (baseWave > 0.7) {
      // Scale remainder 0.7 -> 1.0 to 0.0 -> 1.0 peak, plus the twitch
      let hateLevel = ((baseWave - 0.7) * 3.33) + spasm;
      // Clamp between 0 and 1.5 for extra overdrive limits
      return Math.max(0, Math.min(1.5, hateLevel));
    }
    return 0;
  }
}
