/**
 * B"H
 * @file QuestStateMachine.js
 *
 * Chapter 31: The Mission Counted Its Sparks.
 *
 * The Awtsmoos lets a quest advance by witnessed events, not by coordinate
 * superstition. This machine receives collect/talk/debate signals and returns
 * save-safe state that later city systems can transform into repaired roads.
 */

export class QuestStateMachine {
  constructor(definition) {
    if (!definition?.id) throw new Error('Quest definition id is required.');
    this.definition = definition;
    this.state = { id: definition.id, status: 'active', progress: {} };
  }

  apply(event) {
    if (this.state.status === 'completed') return this.snapshot();
    const objective = this.definition.objectives?.find(item => item.kind === event.kind && item.target === event.target);
    if (!objective) return this.snapshot();

    const current = this.state.progress[objective.id] || 0;
    this.state.progress[objective.id] = Math.min(objective.amount, current + (event.amount || 1));

    const complete = this.definition.objectives.every(item => (this.state.progress[item.id] || 0) >= item.amount);
    if (complete) this.state.status = 'completed';
    return this.snapshot();
  }

  snapshot() {
    return JSON.parse(JSON.stringify(this.state));
  }
}

export default QuestStateMachine;
