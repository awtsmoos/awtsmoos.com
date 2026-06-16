// B"H
const PREFIX = 'awtsmoos.autoplay.';

export function reportKey(jobId) { return PREFIX + jobId; }

export function saveReport(report) {
  const key = reportKey(report.jobId);
  const text = JSON.stringify(report);
  localStorage.setItem(key, text);
  localStorage.setItem(PREFIX + 'latest', text);
  window.__AWTSMOOS_AUTOPLAY_REPORT__ = report;
  window.__AWTSMOOS_AUTOPLAY_DONE__ = report.status === 'pass' || report.status === 'fail';
  window.dispatchEvent(new CustomEvent('awtsmoos-autoplay-report', { detail: report }));
  return key;
}

export async function trySendReport(report) {
  const urls = ['/mitzvahWorld/autoplay-report', '/api/mitzvahWorld/autoplay-report'];
  for (const url of urls) {
    try {
      await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(report), keepalive: true });
      return { ok: true, url };
    } catch (error) { }
  }
  return { ok: false, reason: 'no-report-endpoint' };
}

export function buildReport({ jobId, scenario, status, logger, assertions = [], vitals = {}, error = null }) {
  return { jobId, scenario, status, assertions, vitals, error, log: logger.snapshot(), finishedAt: new Date().toISOString() };
}
