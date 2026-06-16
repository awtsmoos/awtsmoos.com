// B"H
import { createAutoPlayLogger } from './AutoPlayLogger.js';
import { runAction } from './AutoPlayInput.js';
import { buildReport, saveReport, trySendReport } from './AutoPlayReporter.js';
import { collectVitals, waitForBootEvidence, waitForCanvas, waitForDomReady, waitForPlayableWorld } from './AutoPlayWaiters.js';

function assertScenario(names, vitals, playable) {
  return (names || []).map(name => {
    if (name === 'hasCanvas') return { name, ok: vitals.canvasCount > 0 };
    if (name === 'canvasStillThere') return { name, ok: vitals.canvasCount > 0 };
    if (name === 'noBootError') return { name, ok: !vitals.bootError };
    if (name === 'playableWorld') return { name, ok: Boolean(playable && playable.ok) };
    if (name === 'badPlan') return { name, ok: false };
    return { name, ok: true, skipped: true };
  });
}

function captureGlobalErrors(logger) {
  window.addEventListener('error', event => logger.error('window.error', { message: event.message, filename: event.filename, line: event.lineno }));
  window.addEventListener('unhandledrejection', event => logger.error('unhandledrejection', { reason: String(event.reason?.message || event.reason) }));
}

export async function runAutoPlayScenario(scenario, jobId) {
  const logger = createAutoPlayLogger(jobId);
  captureGlobalErrors(logger);
  window.__AWTSMOOS_AUTOPLAY_ACTIVE__ = { jobId, scenario: scenario.name, status: 'running' };
  logger.info('start', { scenario: scenario.name, href: location.href });
  try {
    await waitForDomReady();
    logger.info('dom-ready', collectVitals());
    for (const [index, action] of (scenario.actions || []).entries()) {
      logger.info('action:start', { index, action });
      const result = await runAction(action, logger);
      logger.info('action:done', { index, result });
      if (action.type === 'clickEnter') {
        const canvas = await waitForCanvas(45000);
        logger.info('wait:canvas', canvas);
      }
    }
    const boot = await waitForBootEvidence(10000);
    logger.info('wait:boot-evidence', boot);
    const playable = await waitForPlayableWorld(scenario.playableTimeoutMs || 120000);
    logger.info('wait:playable-world', playable);
    const vitals = collectVitals();
    const assertions = assertScenario(scenario.assertions, vitals, playable);
    const status = assertions.every(a => a.ok) ? 'pass' : 'fail';
    const report = buildReport({ jobId, scenario: scenario.name, status, logger, assertions, vitals });
    saveReport(report);
    trySendReport(report).then(send => logger.info('report:send', send));
    window.__AWTSMOOS_AUTOPLAY_ACTIVE__ = { jobId, scenario: scenario.name, status };
    return report;
  } catch (error) {
    logger.error('fatal', error);
    const report = buildReport({ jobId, scenario: scenario.name, status: 'fail', logger, assertions: [], vitals: collectVitals(), error: error.message || String(error) });
    saveReport(report);
    trySendReport(report).then(send => logger.info('report:send', send));
    window.__AWTSMOOS_AUTOPLAY_ACTIVE__ = { jobId, scenario: scenario.name, status: 'fail' };
    return report;
  }
}
