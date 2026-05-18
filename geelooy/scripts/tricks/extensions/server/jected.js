//B"H
console.log(
`B"H
Welcome`
)
if (!window.awtsmoosFetch) {
    window.awtsmoosFetch = function awtsFetch(url, options = {}) {
		const id = `BH_${Date.now()}_${Math.random()}`;
        class AwtsResponse {
            constructor(metadata) {
                Object.assign(this, metadata);
                this.bodyUsed = false;
            }

            async _requestBody(action) {
                if (this.bodyUsed) {
                    throw new Error("Body has already been consumed.");
                }
                //this.bodyUsed = true;

                return new Promise((resolve, reject) => {
                    
                    function onMessage(event) {
                        if (event.data.from === "background" && event.data.id === id) {
                            window.removeEventListener("message", onMessage);
							//console.log("HI",event.data);
                            if (event.data.error) {
                                reject(new Error(event.data.error));
                            } else {
                                resolve(event.data.result);
                            }
                        }
                    }

                    window.addEventListener("message", onMessage);
                    postMessage({
                        action: "fetch-body",
                        id,
                        bodyAction: action
                    });
                });
            }

            async text() {
                return await this._requestBody("text");
            }

            async json() {
                const text = await this.text();
                return JSON.parse(text);
            }

			async blob() {
				var url = await this._requestBody("blob");
				var blob = await (await fetch(url)).blob();
				return blob;
			}

            get body() {
                return {
                    getReader: () => {
                        let done = false;
                        return {
                            read: async () => {
                                if (done) {
                                    return { done: true, value: undefined };
                                }
                                const value = await this._requestBody("read");
                                if (value === null) {
                                    done = true;
                                    return { done: true, value: undefined };
                                }
								var blob = await (await fetch(value)).blob();
								//console.log("got value",window.f=value);
								const uint8Array = await blob
									.arrayBuffer()
									.then(buffer => new Uint8Array(buffer));

                                return { done: false, value: uint8Array };
                            }
                        };
                    }
                };
            }
        }

        return new Promise((resolve, reject) => {
            function onMessage(event) {
                if (event.data.from === "background" && event.data.id === id) {
                    window.removeEventListener("message", onMessage);
                    if (event.data.error) {
                        reject(new Error(event.data.error));
                    } else {
                        resolve(new AwtsResponse(event.data.metadata));
                    }
                }
            }

            window.addEventListener("message", onMessage);
            postMessage({
                action: "fetch",
                id,
                url,
                options
            });
        });
    };
}
