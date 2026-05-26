/**
 * B"H
 * @file PropertyFeatureCompiler.js
 * @description
 * Materializes yards, gardens, fences, hedges, grass patches, trees, and
 * collectables from property layout data. This keeps Emerald Village property
 * features data-driven while avoiding malformed object literals that prevented
 * the complete village world from importing at all.
 */

function absPos(prop, offset = {}, y = 0) {
  return {
    x: prop.center.x + (offset.x || 0),
    y,
    z: prop.center.z + (offset.z || 0)
  };
}

function addHedge(nivrayim, prop, hedge, index) {
  nivrayim.Domem[`${prop.id}_hedge_${index}`] = {
    name: `${prop.name} Hedge ${index + 1}`,
    position: absPos(prop, hedge.offset, (hedge.height || 1) / 2),
    golem: {
      guf: { BoxGeometry: [hedge.width || 10, hedge.height || 1, hedge.depth || 1] },
      toyr: { MeshStandardMaterial: { color: hedge.color || '#2a6b30' } }
    },
    isSolid: true
  };
}

function addFenceRail(nivrayim, prop, id, offset, size) {
  nivrayim.Domem[id] = {
    name: id,
    position: absPos(prop, offset, size.height / 2),
    golem: {
      guf: { BoxGeometry: [size.width, size.height, size.depth] },
      toyr: { MeshStandardMaterial: { color: size.color } }
    },
    isSolid: true
  };
}

function ensureBuckets(nivrayim) {
  nivrayim.Domem = nivrayim.Domem || {};
  nivrayim.ProceduralTree = nivrayim.ProceduralTree || {};
  nivrayim.ProceduralFlowerPatch = nivrayim.ProceduralFlowerPatch || {};
  nivrayim.GrassPatch = nivrayim.GrassPatch || {};
  nivrayim.Collectable = nivrayim.Collectable || {};
}

export function applyPropertyFeatures(nivrayim, properties) {
  ensureBuckets(nivrayim);

  properties.forEach(prop => {
    const lot = prop.lot || { width: 40, depth: 40 };
    const fenceHeight = prop.fenceHeight || 1.8;
    const fenceColor = prop.fenceType === 'stone'
      ? '#777777'
      : prop.fenceType === 'hedge'
        ? '#2a6b30'
        : '#8b5f2a';

    addFenceRail(nivrayim, prop, `${prop.id}_fence_north`, { x: 0, z: -lot.depth / 2 }, { width: lot.width, height: fenceHeight, depth: 0.4, color: fenceColor });
    addFenceRail(nivrayim, prop, `${prop.id}_fence_south`, { x: 0, z: lot.depth / 2 }, { width: lot.width, height: fenceHeight, depth: 0.4, color: fenceColor });
    addFenceRail(nivrayim, prop, `${prop.id}_fence_east`, { x: lot.width / 2, z: 0 }, { width: 0.4, height: fenceHeight, depth: lot.depth, color: fenceColor });
    addFenceRail(nivrayim, prop, `${prop.id}_fence_west`, { x: -lot.width / 2, z: 0 }, { width: 0.4, height: fenceHeight, depth: lot.depth, color: fenceColor });

    (prop.yardTrees || []).forEach((tree, index) => {
      nivrayim.ProceduralTree[`${prop.id}_yard_tree_${index}`] = {
        name: `${prop.name} Tree ${index + 1}`,
        preset: tree.preset || 'Oak Medium',
        position: absPos(prop, tree.offset, 0),
        scale: tree.scale || 1,
        isSolid: true
      };
    });

    (prop.hedges || []).forEach((hedge, index) => addHedge(nivrayim, prop, hedge, index));

    if (prop.backyard?.flowerPatch) {
      const patch = prop.backyard.flowerPatch;
      nivrayim.ProceduralFlowerPatch[`${prop.id}_flowers`] = {
        position: absPos(prop, patch.offset, 0.05),
        radius: patch.radius,
        count: patch.count,
        flowerType: patch.flowerType || 'daisy'
      };
    }

    nivrayim.GrassPatch[`${prop.id}_yard_grass`] = {
      position: absPos(prop, { x: 0, z: 0 }, 0.02),
      radius: Math.max(lot.width, lot.depth) * 0.55,
      count: 120
    };

    (prop.backyard?.collectables || []).forEach((item, index) => {
      nivrayim.Collectable[`${prop.id}_collectable_${index}`] = {
        ...item,
        position: absPos(prop, item.offset, 0.7)
      };
    });
  });

  return nivrayim;
}
