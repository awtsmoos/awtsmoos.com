/** B"H @module ResourceNodeIndex - repeatable resource nodes. */
export const ResourceNodeIndex = {
  orchard_fig_tree: { name: 'Fig Tree', skill: 'Agriculture', item: 'fig', amount: 2, xp: 6, region: 'Orchard of Seven Species' },
  parchment_reed: { name: 'Parchment Reed', skill: 'Scribing', item: 'scroll', amount: 1, xp: 5, region: 'House of Learning' },
  spark_stone: { name: 'Spark Stone', skill: 'Mining', item: 'SPARK_STONE', amount: 1, xp: 8, region: 'Hidden Path', instance: true }
};
export const allResourceNodes = () => Object.entries(ResourceNodeIndex).map(([id, node]) => ({ id, ...node }));
