/**
 * B"H — Fighter generator panel math. The right side of the vision image
 * is not static decoration: it is a live mirror of the generated player DNA,
 * rendered by Canvas2D as sliders, signature, preview, and a golden radar.
 */
export function generatorMetrics(fighter) {
  const dna = fighter.dna;
  return [
    metric('Height', dna.height, .75, 1.35),
    metric('Mass', dna.mass, .75, 1.45),
    metric('Arm Length', dna.arm, .75, 1.45),
    metric('Leg Length', dna.leg, .75, 1.45),
    metric('Power', dna.power, .65, 1.65),
    metric('Speed', dna.speed, .65, 1.65),
    metric('Recovery', dna.recovery, .65, 1.65),
    metric('Shield', fighter.shield / fighter.stats.shield, 0, 1)
  ];
}

function metric(label, value, min, max) {
  return { label, value, unit: (value - min) / (max - min) };
}

export function signaturePoints(fighter, cx, cy, radius) {
  const metrics = generatorMetrics(fighter).slice(0, 6);
  return metrics.map((m, i) => {
    const a = -Math.PI / 2 + i * Math.PI * 2 / metrics.length;
    const r = radius * Math.max(.08, Math.min(1, m.unit));
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, label: m.label };
  });
}
