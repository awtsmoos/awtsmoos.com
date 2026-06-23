// B"H
import { hyperrealHouseKit } from '../../systems/buildings/HyperrealHouseKit.js';
const kit=hyperrealHouseKit(); for(const need of ['shutters','chimney','roof-overhang','foundation-stones']) if(!kit.mergedDetails.includes(need)) throw new Error(`Missing house detail ${need}`);
console.log('B"H houseDetailAudit passed');
