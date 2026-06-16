// B"H
export const SCENARIOS = Object.freeze({
  smoke: {
    name: 'smoke',
    timeoutMs: 150000,
    playableTimeoutMs: 120000,
    actions: [
      { type: 'clickEnter' },
      { type: 'wait', ms: 2500 },
      { type: 'hold', code: 'KeyW', ms: 1200 },
      { type: 'hold', code: 'KeyD', ms: 600 },
      { type: 'press', code: 'KeyE', ms: 100 },
      { type: 'wait', ms: 2500 }
    ],
    assertions: ['hasCanvas', 'noBootError', 'playableWorld']
  },
  firstMinuteWalk: {
    name: 'firstMinuteWalk',
    timeoutMs: 180000,
    playableTimeoutMs: 120000,
    actions: [
      { type: 'clickEnter' },
      { type: 'wait', ms: 3000 },
      { type: 'hold', code: 'KeyW', ms: 2200 },
      { type: 'hold', code: 'KeyA', ms: 800 },
      { type: 'hold', code: 'KeyW', ms: 1800 },
      { type: 'press', code: 'KeyE', ms: 120 },
      { type: 'hold', code: 'KeyD', ms: 900 },
      { type: 'wait', ms: 3000 }
    ],
    assertions: ['hasCanvas', 'canvasStillThere', 'noBootError', 'playableWorld']
  }
});

export function scenarioFromQuery(params) {
  const rawPlan = params.get('awtsmoosAutoPlan');
  if (rawPlan) {
    try { return JSON.parse(decodeURIComponent(rawPlan)); }
    catch { return { name: 'badPlan', actions: [], assertions: ['badPlan'] }; }
  }
  const name = params.get('awtsmoosAutoPlay') || params.get('autoplay');
  return name ? SCENARIOS[name] || SCENARIOS.smoke : null;
}
