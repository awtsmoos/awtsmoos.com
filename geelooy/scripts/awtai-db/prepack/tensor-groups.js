// B"H

function layerTensorGroups(layer) {
  const p = `blk.${layer}.`;
  return [
    {
      kind: 'attention',
      file: `${pad(layer)}.attention.awtpack`,
      tensors: [
        `${p}attn_norm.weight`,
        `${p}attn_q.weight`,
        `${p}attn_k.weight`,
        `${p}attn_v.weight`,
        `${p}attn_output.weight`,
      ],
    },
    {
      kind: 'ffn',
      file: `${pad(layer)}.ffn.awtpack`,
      tensors: [
        `${p}ffn_norm.weight`,
        `${p}ffn_gate.weight`,
        `${p}ffn_up.weight`,
        `${p}ffn_down.weight`,
      ],
    },
  ];
}

function globalTensorGroups() {
  return [
    {
      kind: 'global',
      file: 'global.awtpack',
      tensors: ['token_embd.weight', 'output_norm.weight', 'output.weight'],
      roles: ['lm_head'],
    },
  ];
}

function resolveGroup(index, group) {
  const found = [];
  const names = new Set();
  for (const name of group.tensors || []) add(index.name(name));
  for (const role of group.roles || []) add(index.role(role));
  return { kind: group.kind, file: group.file, tensors: found };

  function add(tensor) {
    if (!tensor || names.has(tensor.name)) return;
    names.add(tensor.name);
    found.push(tensor);
  }
}

function pad(layer) { return String(layer).padStart(3, '0'); }

module.exports = { layerTensorGroups, globalTensorGroups, resolveGroup };
