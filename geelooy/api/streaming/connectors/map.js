// B"H
const youtube = require('./youtube/index.js');
const twitch = require('./twitch/index.js');
const facebook = require('./facebook/index.js');
const awtsmoos = require('./awtsmoos/index.js');
const connectorMap = { youtube, twitch, facebook, awtsmoos };
module.exports = { connectorMap };
