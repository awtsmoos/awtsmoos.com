/**
 * B"H
 * @file GeneratedBattleLayer.js
 * @description
 * Adds generated mitzvah-format battle targets. These are procedural models,
 * not external assets, so only players/NPCs depend on character GLBs.
 */

import * as THREE from '/games/scripts/build/three.module.js';

/**
 * B"H
 * Shows a small world message through the existing UI bridge when possible.
 *
 * @param {any} olam World.
 * @param {string} text Message.
 * @param {string} color CSS color.
 * @returns {void}
 */
function show(olam, text, color = '#ffcc66') {
  if (olam && typeof olam.ayshPeula === 'function') {
    olam.ayshPeula('ui event', 'effectsOverlay', { text, color });
  } else {
    console.log(`B"H | BATTLE | ${text}`);
  }
}

/**
 * B"H
 * Creates a procedural kelipah/mazik vessel.
 *
 * @param {Object} def Definition.
 * @param {any} olam World.
 * @returns {THREE.Group} Enemy root.
 */
function createMazik(def, olam) {
  const group = new THREE.Group();
  group.name = def.id;
  group.position.set(def.position[0], def.position[1], def.position[2]);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: def.color,
    emissive: def.color,
    emissiveIntensity: 0.18,
    roughness: 0.55,
    metalness: 0.08
  });

  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.85, 1), bodyMat);
  core.position.y = 1.05;
  core.castShadow = true;
  core.receiveShadow = true;
  group.add(core);

  const ringMat = new THREE.MeshBasicMaterial({ color: 0xfff2a8 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.035, 8, 32), ringMat);
  ring.position.y = 1.05;
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  eye.position.set(0, 1.18, 0.78);
  group.add(eye);

  const nivra = {
    type: 'mazik',
    name: def.name,
    mesh: group,
    hp: def.hp,
    maxHp: def.hp,
    xpValue: def.xpValue || 25,
    elementalType: def.elementalType || 'kelipah',
    dialogue: true,
    dialogues: [
      `B"H... ${def.name} blocks the sparks.`,
      'Use Torah, tefillah, and mitzvos to refine this place.',
      'Every hit of kedushah weakens the concealment.'
    ],
    proximity: 7,
    takeDamage(amount = 0) {
      const damage = Math.max(0, Number(amount) || 0);
      this.hp = Math.max(0, this.hp - damage);
      group.userData.hp = this.hp;
      show(olam, `${this.name}: ${Math.ceil(this.hp)}/${this.maxHp}`, '#ff9966');

      if (this.hp <= 0) {
        this.wasSealayked = true;
        group.visible = false;
        show(olam, `${this.name} refined into sparks!`, '#99ff99');
      }
    },
    ayshPeula(action) {
      if (action === 'accepted interaction') {
        show(olam, `${this.name}: ${this.dialogues[1]}`, '#ffdd88');
      }
    }
  };

  nivra.olam = olam;
  group.nivraAwtsmoos = nivra;
  group.userData.isBattleTarget = true;
  group.userData.isNpc = false;
  group.userData.nefeshType = 'mazik';
  group.userData.hp = def.hp;

  group.traverse(child => {
    child.nivraAwtsmoos = nivra;
    child.userData.interactable = true;
    child.userData.isBattleTarget = true;
  });

  return group;
}

/**
 * B"H
 * Adds a minimum battle layer if no battle targets exist yet.
 *
 * @param {Object} context Postbuild context.
 * @returns {Promise<THREE.Group[]>} Added enemies.
 */
export async function ensureGeneratedBattleLayer(context) {
  const scene = context?.scene || context?.olam?.scene;
  const olam = context?.olam;

  if (!scene || typeof scene.add !== 'function') return [];

  let existing = 0;
  scene.traverse(child => {
    if (child?.userData?.isBattleTarget || child?.nivraAwtsmoos?.type === 'mazik') existing++;
  });

  if (existing > 0) return [];

  const defs = [
    { id: 'kelipah_shadow_1', name: 'Shadow of Laziness', position: [8, 0, -14], hp: 70, color: 0x5d2e8c, elementalType: 'atzlus' },
    { id: 'kelipah_shadow_2', name: 'Fog of Confusion', position: [-11, 0, -16], hp: 85, color: 0x2e5d8c, elementalType: 'bilbul' },
    { id: 'kelipah_shadow_3', name: 'Spark-Hoarder', position: [17, 0, 7], hp: 95, color: 0x8c3b2e, elementalType: 'kelipah' },
    { id: 'kelipah_shadow_4', name: 'Void Whisper', position: [-18, 0, 8], hp: 110, color: 0x334433, elementalType: 'void' }
  ];

  const added = defs.map(def => createMazik(def, olam));
  added.forEach(enemy => scene.add(enemy));
  show(olam, `Battle layer awakened: ${added.length} mitzvah targets`, '#ffd966');
  return added;
}
