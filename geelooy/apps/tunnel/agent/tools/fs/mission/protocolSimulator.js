// B"H
function simulate(M, config, m, input = {}) {
  const cycles = Number(input.cycles || 12);
  M.protocolStart(m, { minimumProtocolCycles: cycles, minimumIdeasPerBrainstorm: 50 });
  for (let c = 1; c <= cycles; c++) {
    for (const stage of M.ProtocolStages.names()) {
      M.protocolStage(config, m, { stage, content: content(stage, c), proof: `proof for ${stage} ${c}`, planned: ['plan'], done: ['done'], nextIdeas: ['next one', 'next two'] });
      M.protocolAnswer(m, { multipleChoiceAnswer: 'A', stage });
    }
  }
  return { ok: true, protocol: M.protocolStatus(m), artifacts: artifactList(m) };
}
function artifactList(m) {
  const out = [];
  for (const cycle of m.protocolCycles || []) {
    for (const stage of Object.values(cycle.stages || {})) out.push({ cycleNo: cycle.cycleNo, stage: stage.stage, exists: !!stage.artifact, artifact: stage.artifact });
  }
  return out;
}
function content(stage, c) {
  if (stage === 'WILD_BRAINSTORM') return Array.from({ length: 50 }, (_, i) => `${i + 1}. Cycle ${c} wild idea ${i + 1} for boss protocol`).join('\n');
  if (stage === 'FILE_TOUCH_MAP') return 'geelooy/apps/tunnel/agent/tools/fs/mission/bossProtocol.js\ngeelooy/apps/tunnel/agent/tools/fs/actionGroups/missionActions.js';
  return `# ${stage} cycle ${c}\nConcrete realistic proof with enough words to pass the boss scoring threshold and keep the agent working harder.`;
}
module.exports = { simulate };
