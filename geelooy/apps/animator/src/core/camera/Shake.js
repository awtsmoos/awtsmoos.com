/* B”H */
export class CameraShake {
  static getOffset(intensity, time) {
    if (intensity <= 0) return { x: 0, y: 0, r: 0, scale: 1.0 };

    // Basic sine/cosine drift (breathing)
    const driftX = Math.sin(time * 0.05) * intensity * 0.5;
    const driftY = Math.cos(time * 0.04) * intensity * 0.5;

    // High frequency micro-jitter (the nervous system trembling)
    const jitterX = (Math.random() - 0.5) * 2.0 * intensity * (intensity > 2 ? 0.8 : 0.2);
    const jitterY = (Math.random() - 0.5) * 2.0 * intensity * (intensity > 2 ? 0.8 : 0.2);

    // Deep sub-bass thudding (shattering reality)
    const pulse = Math.sin(time * 0.6) * Math.sin(time * 0.1) * intensity * 2.0;

    // A low probability extreme snapping mechanic (like reality breaking for a single frame)
    let snapX = 0;
    let snapY = 0;
    let snapR = 0;
    if (intensity > 3 && Math.random() > 0.95) {
       snapX = (Math.random() - 0.5) * intensity * 15;
       snapY = (Math.random() - 0.5) * intensity * 15;
       snapR = (Math.random() - 0.5) * intensity * 0.1;
    }

    const x = driftX + jitterX + pulse + snapX;
    const y = driftY + jitterY + pulse + snapY;
    
    // Rotational twisting and zoom tearing the viewer's perception
    const r = (Math.sin(time * 0.08) * 0.002 * intensity) + snapR;
    const scale = 1.0 + (pulse * 0.001);

    return { x, y, r, scale };
  }
}

