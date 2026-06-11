// B"H
/**
 * @file theme.js
 * @description
 * Chapter 644: The lava ladder receives a readable garment with many crowns.
 *
 * The Awtsmoos turns raw coordinates into a visible language: green beginning,
 * sandstone danger-road, blue moving breath, gold reward, and cyan mezuzah goal.
 * Some stones wear two crowns, such as reward and finish; therefore every
 * platform keeps both a primary `visualRole` and a full `visualRoles` array.
 */
export const LAVA_THEME = Object.freeze({
  id: 'lava-ladder-golden-village',
  biome: 'lava',
  lighting: 'golden-hour-lava-bounce',
  mood: 'warm-danger-readable-platforming',
  palette: { start: 0x3fbf6f, path: 0xb9894c, crumb: 0xc48c52, moving: 0x5ec8ff, reward: 0xffc84d, finish: 0x72fff4, hazard: 0x7a1f0d },
  ui: { headline: 'Lava Ladder', mission: 'Collect the perutos, give tzedakah, and return through the mezuzah gate.', hint: 'Use the joystick, read the platform colors, and never trust the lava.' }
});

/** @param {string[]} roles Role list. @returns {string} Primary role. */
function primaryRole(roles) {
  for (const role of ['start', 'finish', 'reward', 'moving', 'crumb', 'path']) if (roles.includes(role)) return role;
  return roles[0] || 'path';
}

/** @param {string[]} roles Roles. @returns {string} Gameplay hint. */
function joinedHint(roles) {
  const hints = roles.map(hintForRole).filter(Boolean);
  return [...new Set(hints)].join(' / ');
}

/** @param {object} platform Platform data. @param {string} role Visual role. @returns {object} Same platform. */
export function markPlatform(platform, role) {
  if (!platform) return platform;
  const roles = new Set(Array.isArray(platform.visualRoles) ? platform.visualRoles : []);
  if (platform.visualRole) roles.add(platform.visualRole);
  roles.add(role);
  platform.visualRoles = [...roles];
  platform.visualRole = primaryRole(platform.visualRoles);
  platform.theme = LAVA_THEME.id;
  platform.textureSeed = `${platform.visualRoles.join('_')}_${platform.name || 'platform'}`;
  platform.color = LAVA_THEME.palette[platform.visualRole] || platform.color || LAVA_THEME.palette.path;
  platform.gameplayHint = joinedHint(platform.visualRoles);
  return platform;
}

function hintForRole(role) {
  if (role === 'start') return 'Safe start platform';
  if (role === 'finish') return 'Goal platform with return mezuzah';
  if (role === 'moving') return 'Moving safe platform';
  if (role === 'reward') return 'Reward or tzedakah platform';
  if (role === 'crumb') return 'Small precision platform';
  if (role === 'path') return 'Safe path platform';
  return '';
}

/** @param {number} level Level number. @param {number} difficulty Difficulty score. @returns {object} Presentation metadata. */
export function levelPresentation(level, difficulty = level) {
  return { theme: LAVA_THEME.id, biome: LAVA_THEME.biome, lighting: LAVA_THEME.lighting, titleCard: `${LAVA_THEME.ui.headline} ${level}`, missionText: LAVA_THEME.ui.mission, hintText: LAVA_THEME.ui.hint, difficultyTier: tierFor(level), estimatedDifficulty: difficulty, readabilityContract: ['green-start', 'sandstone-path', 'blue-moving-when-present', 'gold-reward', 'cyan-finish', 'red-lava-danger'] };
}

function tierFor(level) {
  if (level <= 5) return 'intro';
  if (level <= 10) return 'learning-motion';
  if (level <= 15) return 'precision';
  return 'mastery';
}
