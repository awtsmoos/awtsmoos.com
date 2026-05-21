// B"H
// tests/insight/worldCityReport.mjs

import { maps } from '../../js/data/maps.js';
import { MAJOR_CITIES } from '../../js/data/world/majorCities.js';

/**
 * Chapter 2: A world map is a vow. This report checks whether each named city
 * actually has ground beneath its name and whether its Chabad house points to a
 * real warm room instead of a painted door.
 */
function buildWorldCityReport() {
    const missingCities = MAJOR_CITIES.filter(city => !maps[city.id]).map(city => city.id);
    const missingChabadHouses = MAJOR_CITIES
        .filter(city => city.chabadHouse && !maps[city.chabadHouse])
        .map(city => ({ city: city.id, chabadHouse: city.chabadHouse }));

    return { cityCount: MAJOR_CITIES.length, missingCities, missingChabadHouses };
}

console.log(JSON.stringify(buildWorldCityReport(), null, 2));
