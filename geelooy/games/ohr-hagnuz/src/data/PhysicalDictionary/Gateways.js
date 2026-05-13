
import { PortalBonds } from '../maps/PortalBonds.js';

export const Gateways = {
    '🪜': { t: 'G_STAIRS', solid: false, isPortal: true, desc: 'A ladder set upon the earth, its top reaching to heaven.' }
};

const BUILDING_PORTALS = [
    '☗','☖','★','☆','♜','♖','⛺','🎪',
    '🏰','🏯','🏠','🏡','🏢','🏬','🕌','🕍', '🏣', '🏤', '🏕️', '🪔'
];

Object.keys(PortalBonds).forEach(key => {
    if (BUILDING_PORTALS.includes(key)) {
        Gateways[key] = { t: 'G_DOOR_WOOD', solid: false, isPortal: true, desc: 'A doorway to an inner realm.' };
    } else if (!Gateways[key]) {
        Gateways[key] = { t: 'G_DIRT_PATH', solid: false, isPortal: true, desc: 'The King\'s Highway continues...' };
    }
});
