//B"H
//Blessed is He
//Boruch Hashem

/**
 * @module AgentTranslateRoutes
 * @description
 * Barrel for AgentTranslateRoutes: class plus prototype mixins, identical export surface.
 */

const { AgentTranslateRoutes } = require('./routesClass.js');
const translateMixin = require('./routesTranslate.js');
const jobSubmitMixin = require('./routesJobSubmit.js');
const readMixin = require('./routesRead.js');
const postWriteMixin = require('./routesPostWrite.js');
const postListMixin = require('./routesPostList.js');
const heichelMixin = require('./routesHeichel.js');
Object.assign(AgentTranslateRoutes.prototype, translateMixin, jobSubmitMixin, readMixin, postWriteMixin, postListMixin, heichelMixin);

module.exports = { AgentTranslateRoutes };
