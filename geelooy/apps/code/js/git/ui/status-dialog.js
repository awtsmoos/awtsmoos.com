Find the commit-button handler that currently calls:

await GitCommit.performCommit(item, gitInfo, changes, msg);

Replace that call with this exact guarded version:

const { autonomousCommitGate } = await import('../../ai/agent/autonomous-commit-gate.js');
autonomousCommitGate.markAgentFinished("manual status dialog commit requested after staged files were prepared");
autonomousCommitGate.assertCanCommit({ requireTests: false });
await GitCommit.performCommit(item, gitInfo, changes, msg, {
  onPhase: phase => {
    import('../../ai/agent/timeline-store.js').then(({ AgentTimeline }) => {
      AgentTimeline.push({
        type: phase.type || "commitPrepare",
        label: phase.label || "Committing",
        collapsed: phase.collapsed ?? true,
        details: phase
      });
    });
  }
});