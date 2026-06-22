// B"H
const { spawnSync } = require("child_process");

/**
 * B"H
 * Chapter 83: The regression menorah gained root preview route proof.
 */
const tests = [
  "geelooy/apps/tunnel/agent/testing/manifestGenerationSmoke.cjs",
  "geelooy/tests/unified-tunnel/stressUnifiedTunnel.cjs",
  "geelooy/tests/unified-tunnel/tunnelFullActionRouteStress.test.mjs",
  "geelooy/tests/unified-tunnel/allActionsStress.test.cjs",
  "geelooy/tests/unified-tunnel/tunnelActionCoverageAudit.cjs",
  "geelooy/tests/unified-tunnel/openApiCommandTreeParams.test.cjs",
  "geelooy/api/tunnel/control/core/test/tunnelPayloadLimits.test.cjs",
  "geelooy/api/tunnel/control/core/test/usageStorePeruta.test.cjs",
  "geelooy/api/tunnel/control/core/test/ephemeralStore.test.cjs",
  "geelooy/api/tunnel/control/billing/test/computeCoins.test.cjs",
  "geelooy/api/tunnel/control/preview/test/previewGatewayStore.test.cjs",
  "geelooy/api/tunnel/control/preview/test/previewRootViewRoute.test.cjs",
  "geelooy/api/tunnel/control/routes/test/protectedFsTimeout.test.cjs",
  "geelooy/api/tunnel/control/routes/test/protectedFsPerutaGuard.test.cjs",
  "geelooy/apps/tunnel/agent/tools/fs/test/gitIgnoreHygiene.test.cjs",
  "geelooy/apps/tunnel/agent/tools/fs/test/millionScalePaging.test.cjs",
  "geelooy/apps/tunnel/agent/tools/fs/test/previewActions.test.cjs",
  "geelooy/apps/tunnel/agent/tools/fs/test/ephemeralActions.test.cjs",
  "geelooy/apps/tunnel/agent/tools/fs/test/renderLabActions.test.cjs",
  "geelooy/apps/tunnel/agent/tools/fs/test/commandTreeCore.test.cjs",
  "geelooy/apps/tunnel/agent/tools/fs/test/commandTreeBudgetVisualize.test.cjs",
  "geelooy/api/tunnel/control/routes/test/protectedFsCarrierNormalize.test.cjs",
  "geelooy/apps/tunnel/agent/tools/fs/test/writeActionsSmoke.test.cjs",
  "geelooy/apps/tunnel/agent/tools/fs/test/commandAsyncJobs.test.cjs",
  "geelooy/apps/tunnel/agent/tools/fs/test/commandOutputPagination.test.cjs",
  "geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-service/render-lab/testRenderLab.mjs",
  "geelooy/tests/unified-tunnel/commandSimulationParity.test.mjs",
  "geelooy/tests/unified-tunnel/browserTabRegistrationSmoke.test.mjs",
  "geelooy/shared/virtual-os/command/test/commandContract.test.mjs",
  "geelooy/shared/virtual-os/process/test/processRecord.test.mjs",
  "geelooy/tests/unified-tunnel/vesselParityMatrix.test.mjs",
  "geelooy/shared/virtual-os/fs/test/actionsPathResult.test.mjs",
  "geelooy/shared/virtual-os/fs/test/browserStorageAdapter.test.mjs",
  "geelooy/shared/virtual-os/fs/test/hostedAwtsmoosAdapter.test.mjs",
  "geelooy/shared/virtual-os/fs/test/postMessageOsAdapter.test.mjs",
  "geelooy/apps/code/js/fs/test/osFolderProviderAdapter.test.mjs",
  "geelooy/apps/code/js/fs/test/awtsmoosOsProviderAdapter.test.mjs",
  "geelooy/api/tunnel/control/routes/test/routeTableNoDuplicates.test.cjs",
  "geelooy/api/tunnel/control/routes/fsVessel/test/resolveFsVessel.test.cjs",
  "geelooy/api/tunnel/control/routes/osFs/test/pathJail.test.cjs",
  "geelooy/api/tunnel/control/routes/osFs/test/publicUrls.test.cjs",
  "geelooy/api/tunnel/control/routes/osFs/test/writeOpsPublicUrls.test.cjs",
  "geelooy/api/tunnel/control/routes/osFs/test/writeIfHashPublicUrls.test.cjs",
  "geelooy/apps/tunnel/test/indexHtml.test.cjs",
  "geelooy/apps/tunnel/js/test/browserPageTunnel.test.mjs",
  "geelooy/apps/tunnel/js/test/browserPageTunnelPagination.test.mjs",
  "geelooy/apps/code/js/tunnel/test/browserAgentPackets.test.mjs",
  "geelooy/apps/code/js/tunnel/test/browserAgentPacketsStress.test.mjs",
  "geelooy/apps/code/js/tunnel/test/browserCommandAdapter.test.mjs",
  "geelooy/apps/tunnel-control/js/api/test/buildFsUrl.test.mjs",
  "geelooy/apps/tunnel-control/js/api/test/targetVesselRouting.test.mjs",
  "geelooy/apps/tunnel-control/js/features/test/aiAgentsProviders.test.mjs",
  "geelooy/apps/tunnel-control/js/features/test/aiAgentsRender.test.mjs",
  "geelooy/apps/tunnel-control/js/features/test/aiAgentsTargetVessel.test.mjs",
  "geelooy/apps/tunnel-control/js/features/test/computeRender.test.mjs",
  "geelooy/apps/tunnel-control/js/features/test/previewGatewayRender.test.mjs",
  "geelooy/apps/tunnel-control/js/features/test/usageMissionActions.test.mjs",
  "geelooy/apps/tunnel-control/js/features/status/test/statusCards.test.mjs",
  "geelooy/apps/tunnel-control/js/features/status/test/renderDeviceNice.test.mjs",
  "geelooy/apps/tunnel-control/js/features/modes/test/modeCards.test.mjs",
  "geelooy/apps/tunnel-control/js/features/vessels/test/vesselSelector.test.mjs",
  "geelooy/apps/tunnel-control/js/features/health/test/healthMatrix.test.mjs",
  "geelooy/apps/tunnel-control/js/dashboard/test/dashboardHealth.test.mjs",
  "geelooy/apps/tunnel/agent/testing/missionAutopilotSelfMail.test.cjs"
];

const started = Date.now();
const results = [];
for (const file of tests) {
  const run = spawnSync(process.execPath, [file], { cwd: process.cwd(), encoding: "utf8", env: { ...process.env, NODE_NO_WARNINGS: "1" } });
  results.push({ file, ok: run.status === 0, status: run.status, stdout: run.stdout.trim(), stderr: run.stderr.trim() });
  if (run.status !== 0) {
    console.error(JSON.stringify({ ok: false, failed: file, results }, null, 2));
    process.exit(run.status || 1);
  }
}
const warnings = results.filter(result => result.stderr).length;
console.log(JSON.stringify({ ok: true, suite: "unified-tunnel-regression", count: results.length, warnings, durationMs: Date.now() - started, results }, null, 2));
