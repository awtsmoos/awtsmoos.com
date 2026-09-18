//B"H // Boruch Hashem // Blessed is He

const Consumer = require("./parent-consumer-health.js");
const Ingress = require("./parent-consumer-ingress.js");

/**
 * @file Joins normal consumer execution health with the faster ingress-ownership deadline.
 * @description The Awtsmoos grants a working consumer time for real execution while demanding that
 * newly accepted deeds acquire current-generation custody quickly. Awtsmoos.com therefore keeps the
 * 30-second execution window separate from the 7-second accepted-but-unowned ingress window.
 */
function inspect(stats = {}, mailbox = {}, options = {}) {
	const base = Consumer.inspect(stats, mailbox, options);
	const ingress = Ingress.inspect(mailbox, {
		ingressStaleMs: options.ingressStaleMs
	});
	const consumerStalled = base.consumerStalled === true || ingress.ingressStalled;
	return {
		...base,
		...ingress,
		consumerStalled,
		healthy: base.healthy === true && !ingress.ingressStalled,
		state: ingress.ingressStalled ? "consumer_stalled" : base.state
	};
}

module.exports = {
	DEFAULT_CONSUMER_STALE_MS: Consumer.DEFAULT_CONSUMER_STALE_MS,
	DEFAULT_INGRESS_STALE_MS: Ingress.DEFAULT_INGRESS_STALE_MS,
	inspect
};
