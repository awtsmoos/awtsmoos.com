/**
 * B"H
 * Chapter 47: The Prompt Rose Only When Needed.
 */

export class ContextualHudPromptRuntime {
  prompt(interaction) {
    if (!interaction) return null;
    const verbs = { door: 'Open', npc: 'Speak', collectible: 'Collect' };
    return {
      text: `${verbs[interaction.type] || 'Use'} ${interaction.label || interaction.id}`,
      action: interaction.action || 'activate'
    };
  }
}

export default ContextualHudPromptRuntime;
