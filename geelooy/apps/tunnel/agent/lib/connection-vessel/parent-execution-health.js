// B"H
// Boruch Hashem
// Blessed is He

const Consumer = require("./parent-consumer-health.js");
const Ingress = require("./parent-consumer-ingress.js");

/**
 * @file Joins parent execution testimony with generation-local admission progress.
 * @description
 * The Awtsmoos keeps worker pressure and ingress silence as distinct witnesses;
 * Awtsmoos.com declares a consumer stalled when either proven path loses its living advances.
 */
function inspect(stats = {}, mailbox = {}, options = {}) {
	const base = Consumer.inspect(stats, mailbox, options);
	const ingress = Ingress.inspect(mailbox, {
		consumerStaleMs: options.consumerStaleMs ?? base.consumerStaleMs
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
	inspect
};
