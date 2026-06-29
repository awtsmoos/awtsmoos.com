import { abyssOfDin } from './abyssOfDin.js';
import { alephRiftExpanse } from './alephRiftExpanse.js';
import { beitMidrashBouncer } from './beitMidrashBouncer.js';
import { binahTowerLabyrinth } from './binahTowerLabyrinth.js';
import { celestialGate } from './celestialGate.js';
import { chesedRiverBridges } from './chesedRiverBridges.js';
import { crownRuins } from './crownRuins.js';
import { crystalSefirah } from './crystalSefirah.js';
import { gevurahForgeExpanse } from './gevurahForgeExpanse.js';
import { hodMirrorPalace } from './hodMirrorPalace.js';
import { kesserCrownRift } from './kesserCrownRift.js';
import { malchusEndlessMeadow } from './malchusEndlessMeadow.js';
import { merkavaBattlefield } from './merkavaBattlefield.js';
import { merkavaPinballCourt } from './merkavaPinballCourt.js';
import { netzachCauseway } from './netzachCauseway.js';
import { riverOfLight } from './riverOfLight.js';
import { sevenHeichalos } from './sevenHeichalos.js';
import { templeOfEchoes } from './templeOfEchoes.js';
import { throneOfFire } from './throneOfFire.js';
import { tiferesBattlefieldVast } from './tiferesBattlefieldVast.js';
import { treeOfLifeArena } from './treeOfLifeArena.js';
import { upgradeLevel } from './upgradeLevels.js';
import { yesodMoonEngine } from './yesodMoonEngine.js';
import { ADVENTURE_MAPS } from '../adventure/adventureLevels.js';

/** B"H — Map registry with VS arenas and fifty Adventure gates. */
const RAW_MAPS = [
  beitMidrashBouncer, merkavaPinballCourt, tiferesBattlefieldVast,
  malchusEndlessMeadow, binahTowerLabyrinth, kesserCrownRift,
  gevurahForgeExpanse, chesedRiverBridges, netzachCauseway,
  hodMirrorPalace, yesodMoonEngine, alephRiftExpanse,
  merkavaBattlefield, treeOfLifeArena, sevenHeichalos, throneOfFire,
  crystalSefirah, abyssOfDin, riverOfLight, templeOfEchoes,
  celestialGate, crownRuins
];

export const MAPS = RAW_MAPS.map(upgradeLevel);
export { ADVENTURE_MAPS };
