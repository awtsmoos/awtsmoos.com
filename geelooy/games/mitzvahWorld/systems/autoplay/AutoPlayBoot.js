// B"H
import { scenarioFromQuery } from './AutoPlayScenarios.js';
import { runAutoPlayScenario } from './AutoPlayRunner.js';

function makeJobId(params, scenario) {
  return params.get('awtsmoosAutoJob') || `${scenario.name}-${Date.now().toString(36)}`;
}

export function bootAutoPlayFromQuery(scope = globalThis) {
  if (!scope.window || !scope.location) return null;
  const params = new URLSearchParams(scope.location.search);
  const scenario = scenarioFromQuery(params);
  if (!scenario) return null;
  const jobId = makeJobId(params, scenario);
  scope.__AWTSMOOS_AUTOPLAY_REQUEST__ = { jobId, scenario: scenario.name, at: new Date().toISOString() };
  scope.setTimeout(() => runAutoPlayScenario(scenario, jobId), Number(params.get('awtsmoosAutoDelay') || 300));
  return { jobId, scenario: scenario.name };
}

bootAutoPlayFromQuery();
