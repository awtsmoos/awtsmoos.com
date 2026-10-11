// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H — Mission Board facade.
 * The single management surface for everything missions:
 *   boards & marketplace (1)      capsules (2)        templates (3)
 *   swarm (4)                     scheduler (5)       dashboard (6)
 *   pause/resume (7)              chaining (8)        messages (9)
 *   autopsy (10)                  voice (11)          federation (12)
 */

const Service = require("./service.js");
const Capsules = require("./capsules.js");
const Templates = require("./templates.js");
const Swarm = require("./swarm.js");
const Scheduler = require("./scheduler.js");
const Lifecycle = require("./lifecycle.js");
const Chaining = require("./chaining.js");
const Messages = require("./messages.js");
const Autopsy = require("./autopsy.js");
const Voice = require("./voice.js");
const Federation = require("./federation.js");
const Dashboard = require("./dashboard.js");
const Store = require("./store.js");

module.exports = {
	Store,
	// core board
	create: Service.create,
	board: Service.board,
	marketplace: Service.marketplace,
	get: Service.get,
	claim: Service.claim,
	assign: Service.assign,
	release: Service.release,
	setProgress: Service.setProgress,
	addNote: Service.addNote,
	addCheckpoint: Service.addCheckpoint,
	completeCheckpoint: Service.completeCheckpoint,
	context: Service.context,
	// (2) capsules
	capsuleCreate: Capsules.create,
	capsuleLoad: Capsules.load,
	capsuleLatest: Capsules.latest,
	// (3) templates
	templateList: Templates.list,
	templateFind: Templates.find,
	templateRegister: Templates.register,
	templateInstantiate: Templates.instantiate,
	// (4) swarm
	swarmSplit: Swarm.split,
	swarmMerge: Swarm.merge,
	swarmChildren: Swarm.childrenOf,
	// (5) scheduler
	scheduleCreate: Scheduler.create,
	scheduleList: Scheduler.list,
	scheduleSetActive: Scheduler.setActive,
	scheduleTick: Scheduler.tick,
	// (7) lifecycle
	pause: Lifecycle.pause,
	resume: Lifecycle.resume,
	complete: Lifecycle.complete,
	fail: Lifecycle.fail,
	// (8) chaining
	chainAdd: Chaining.add,
	// (9) messages
	messageSend: Messages.send,
	messageInbox: Messages.inbox,
	// (10) autopsy
	autopsyRecord: Autopsy.record,
	autopsyLessons: Autopsy.lessons,
	// (11) voice
	voiceDictate: Voice.dictate,
	// (12) federation
	federationExport: Federation.exportMission,
	federationImport: Federation.importMission,
	// (6) dashboard
	dashboardSnapshot: Dashboard.snapshot,
	dashboardPage: Dashboard.renderPage
};
