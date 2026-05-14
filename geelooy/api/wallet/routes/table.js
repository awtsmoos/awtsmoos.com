
// B"H

const { me } = require("./me.js");
const { balance } = require("./balance.js");
const { buyMock } = require("./buyMock.js");
const { paypalCreate } = require("./paypalCreate.js");
const { paypalCapture } = require("./paypalCapture.js");

const routeTable = {
  me,
  balance,
  "buy/mock": buyMock,
  "paypal/create": paypalCreate,
  "paypal/capture": paypalCapture
};

module.exports = { routeTable };
