
import { MishnahAvot1 } from './wisdom/MishnahAvot1.js';
import { MishnahAvot2 } from './wisdom/MishnahAvot2.js';
import { MishnahBerakhot1 } from './wisdom/MishnahBerakhot1.js';
import { KabbalahReishis } from './wisdom/KabbalahReishis.js';
import { KabbalahOhr } from './wisdom/KabbalahOhr.js';
import { KabbalahZohar1 } from './wisdom/KabbalahZohar1.js';
import { ChassidusTanya1 } from './wisdom/ChassidusTanya1.js';
import { ChassidusTanya2 } from './wisdom/ChassidusTanya2.js';
import { NiggunJoy } from './wisdom/NiggunJoy.js';

// Deep Sub-Modules
import { MorehNevuchim1 } from './wisdom/drush/MorehNevuchim1.js';
import { SeferYetzirah1 } from './wisdom/sod/SeferYetzirah1.js';
import { LikkuteiMoharan1 } from './wisdom/chassidus/LikkuteiMoharan1.js';
import { NefeshHaChaim1 } from './wisdom/chassidus/NefeshHaChaim1.js';
import { GemaraBavaMetzia1 } from './wisdom/pshat/GemaraBavaMetzia1.js';
import { GemaraShabbos1 } from './wisdom/pshat/GemaraShabbos1.js';

/**
 * B"H
 * @module MasterWisdom
 */
export const MasterWisdom = {
    'M_AVOT_1': MishnahAvot1,
    'M_AVOT_2': MishnahAvot2,
    'M_BERAKHOT_1': MishnahBerakhot1,
    'K_REISHIS_1': KabbalahReishis,
    'K_LIGHT_2': KabbalahOhr,
    'K_ZOHAR_1': KabbalahZohar1,
    'C_TANYA_1': ChassidusTanya1,
    'C_TANYA_2': ChassidusTanya2,
    'N_JOY_1': NiggunJoy,
    
    'D_MOREH_1': MorehNevuchim1,
    'S_YETZIRAH_1': SeferYetzirah1,
    'C_MOHARAN_1': LikkuteiMoharan1,
    'C_NEFESH_1': NefeshHaChaim1,
    'P_BAVAMETZIA_1': GemaraBavaMetzia1,
    'P_SHABBOS_1': GemaraShabbos1
};
