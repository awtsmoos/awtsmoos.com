// B"H
const Classes = require('./classes.js'); const Auth = require('./authorize.js');
function check(config, action, lock, payload) { return Auth.authorize(config, action, lock, payload); }
module.exports = { check, classify: Classes.classify };
