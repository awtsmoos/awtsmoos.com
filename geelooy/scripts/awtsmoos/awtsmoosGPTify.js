//B"H
// Boruch Hashem
// Blessed is He

(function installLegacyAwtsmoosGPTify(globalObject) {
	const facadeUrl = "/scripts/awtsmoos/AwtsmoosGPTifyFacade.js";

	/**
	 * This historical script URL now awakens the verified modern Awtsmoos.com
	 * client. The Awtsmoos keeps the constructor immediately available while every
	 * method waits for one shared module import and no old token logic survives.
	 */
	class AwtsmoosGPTify {
		constructor(options = {}) {
			this.ready = import(facadeUrl).then(module => {
				return new module.LegacyAwtsmoosGPTifyFacade(options);
			});
		}

		go(options) {
			return this.invoke("go", options);
		}

		getConversation(conversationId) {
			return this.invoke("getConversation", conversationId);
		}

		getConversations(options) {
			return this.invoke("getConversations", options);
		}

		getParentState(conversationId) {
			return this.invoke("getParentState", conversationId);
		}

		getDirectCapability() {
			return this.invoke("getDirectCapability");
		}

		createNewConversation() {
			return this.invoke("createNewConversation");
		}

		getAwtsmoosAudio(options) {
			return this.invoke("getAwtsmoosAudio", options);
		}

		getAwtsmoosAudioStream(options) {
			return this.invoke("getAwtsmoosAudioStream", options);
		}

		invoke(method, argument) {
			return this.ready.then(instance => {
				return argument === undefined
					? instance[method]()
					: instance[method](argument);
			});
		}
	}

	globalObject.AwtsmoosGPTify = AwtsmoosGPTify;
	globalObject.AwtsmoosGPTifyReady = Promise.resolve(AwtsmoosGPTify);
})(globalThis);
