//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file system-catalog.js
 * @description The Awtsmoos gathers stable Data, Security, and Realtime teaching concepts while each district remains a small inspectable module.
 */

const data = require("./system-catalog-data.js");
const security = require("./system-catalog-security.js");
const realtime = require("./system-catalog-realtime.js");

const systems = [...data, ...security, ...realtime];
const districts = [
	{ id: "data", title: "Data and Persistence" },
	{ id: "security", title: "Security and Trust" },
	{ id: "realtime", title: "Realtime and WebSockets" }
];

module.exports = { systems, districts };
