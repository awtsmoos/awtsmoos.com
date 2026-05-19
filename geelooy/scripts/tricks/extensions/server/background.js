// B"H
console.log('B"H');

chrome.webNavigation.onCompleted.addListener(async details => {
    chrome.scripting.executeScript({
        target: { tabId: details.tabId },
        files: ['awtsmoosContent.js'],
		
        //runAt: 'document_start' 
    });
});

const ChromePortManager = globalThis.ChromePortManager || class ChromePortManager {
  constructor() {
    this.ports = {}; // Store active ports
    this.events = {}; // Store event listeners
    this.init();
  }

  // Event listener registration
  on(event, listener) {
    if (typeof event === 'object') {
      // If event is an object, register multiple listeners at once
      for (const [key, fn] of Object.entries(event)) {
        this.on(key, fn);
      }
    } else {
      // Ensure the event array is initialized
      if (!this.events[event]) {
        this.events[event] = [];
      }
      // Add listener to the event
      this.events[event].push(listener);
    }
  }

  // Emit events to listeners
  emit(event, ...data) {
    if (this.events[event]) {
      this.events[event].forEach(async listener => await listener(...data));
    }
  }

  // Initialize connection handlers
  init() {
    chrome.runtime.onConnect.addListener((port) => {
      console.log("New connection", port);
      this.handleNewConnection(port);
    });

    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      console.log("Received message", message);
      await this.handleMessage(message, sendResponse);
    });
  }

  // Handle messages received from a port
  async handlePortMessage(port, message) {
    console.log("Handling port message", message);

    // Emit event for the message if there's an action for it
    if (message.action) {
      this.emit(message.action, message, port); // Emit dynamic event based on action
    }

    // Handle port-specific registration
    if (message.name) {
      this.registerPortByName(port, message.name);
    }

    // Handle sending message to another port
    if (message.to) {
      await this.sendMessageToPort(message);
    }

    // Auto-reply to the port (if needed)
    if (message.reply) {
      this.reply(port, message.reply);
    }
  }

  // Auto-reply function to send messages back to the correct port
  reply(port, data) {
    console.log("Sending reply to port", port,data);
    if (port) {
		var ob = {
        ...data,
        from: data.name || 'background'
      };
	  
      port.postMessage(ob);
      console.log("Reply sent:", ob);
    }
  }

  // Handle incoming messages from the background script or other sources
  async handleMessage(message, sendResponse) {
    switch (message.command) {
      case 'send':
        console.log("Handling send command", message);
        await this.sendMessageToPort(message);
        sendResponse({status: "Message sent"});
        break;

      default:
        console.log("Unhandled command", message.command);
        sendResponse({error: "Unknown command"});
    }
  }

  // Method for port-specific registration
  registerPortByName(port, name) {
    if (!this.ports[name]) {
      console.log("New port registered:", name);
      this.ports[name] = port;
    }
  }

  // Method to send a message to another port
  async sendMessageToPort(message) {
    const { to } = message;
    const targetPort = this.ports[to];
    if (targetPort) {
      try {
        targetPort.postMessage({
          ...message,
          from: message.name || message.from,
        });
        console.log("Message sent to port", to);
      } catch (e) {
        console.error("Error sending message to port", e);
        this.onPortDisconnect(targetPort); // Attempt to disconnect on error
      }
    }
  }

  // Port disconnection handler
  onPortDisconnect(port) {
    const { name } = port;
    delete this.ports[name];
    console.log("Deleted port with name:", name);
  }

  // Handle new connection (optional: for handling port setup)
  handleNewConnection(port) {
    console.log("Handling new connection", port);
    port.onMessage.addListener(async (message) => {
      await this.handlePortMessage(port, message);
    });
    
    // Listen for the port being disconnected
    port.onDisconnect.addListener(() => {
      console.log("Port disconnected:", port);
      this.onPortDisconnect(port);
    });
  }
};

globalThis.ChromePortManager = ChromePortManager;

// Instantiate the class
const portManager = globalThis.__awtsmoosPortManager || new ChromePortManager();
globalThis.__awtsmoosPortManager = portManager;

portManager.on("ping", async (msg, p) => {
	portManager.reply(p, {
		pong: msg
	})
});

// Trigger an event with 'customEvent' action and reply
portManager.on('customEvent', async (message, port) => {
    console.log('Custom event received:', message, port);

    // Simulate some logic, then send a reply
    await new Promise(resolve => setTimeout(resolve, 500));  // Simulating async work

    // Send a reply back to the port
	message.LOL = 1234
    portManager.reply(port, { status: 'Processed', data: message });
});
/*
portManager.on("fetch", async (msg, port) => {
	var d = msg?.data;
	var url = d?.url
	var opts = d?.options;
	var func = d?.after;
	try {
		var parst = new URL(url)
		var cooks = await getCookieString(parst.host)
		var res = await fetch(url, opts);
		var {
			status,
			ok,
			type,
			url,
			redirected
		} = res;
		var resObj = {
			status,
			ok,
			type,
			url,
			redirected
		}
		//console.log("res",resObj, res);
		var f = await res?.[func]();
		var headers = [];
		for (const pair of res.headers.entries()) {
			headers.push({
				[pair[0]]:pair[1]
			})
		  // console.log(pair[0]+ ': '+ pair[1]);
		}
		portManager.reply(port, {
			result: f,
			headers,
			response: resObj,
			cookies: cooks,
			id: msg?.id
		})
	} catch(e) {
		portManager.reply(port, {
			error: e.stack,
			result:`B"H
You got an error!

<div style="color:red">
${e.stack}
</div>
<div>
URL: ${url}<br>
options: ${JSON.stringify(opts)}
</div>
`,
			tried: {
				url
			},
			id: msg?.id
		})
	}
})
*/

const activeResponses = new Map();

portManager.on("fetch", async (msg, port) => {
    const { id, url, options } = msg;

    try {
        const safeOptions = {
            ...(options || {}),
            credentials: options?.credentials || "include",
            cache: options?.cache || "no-store"
        };
        const response = await fetch(url, safeOptions);
        const metadata = {
            status: response.status,
            ok: response.ok,
            headers: Array.from(response.headers.entries()),
            url: response.url,
            redirected: response.redirected,
        };
		var parst = new URL(url)
		var cooks = await getCookieString(parst.hostname)
		metadata.cookies = { count: cooks?.cookies?.length || 0 };

        const bodyReader = response.body?.getReader();
        activeResponses.set(id, { reader: bodyReader, empty: !bodyReader });

        portManager.reply(port, { metadata, id });
    } catch (error) {
        portManager.reply(port, { error: error.stack, id });
    }
});

portManager.on("fetch-body", async (msg, port) => {
    const { id, bodyAction } = msg;

    try {
        const active = activeResponses.get(id);
        if (!active) {
            throw new Error("Response not found or already consumed.");
        }

        const { reader, empty } = active;
        if (empty || !reader) {
            activeResponses.delete(id);
            portManager.reply(port, { result: bodyAction === "read" ? null : "", id });
            return;
        }

        if (
			bodyAction === "text" || 
			bodyAction === "json" ||
			bodyAction == "blob"
		) {
            const chunks = [];
            let done = false;

            // Keep reading the stream until it is done
            while (!done) {
                const { done: isDone, value } = await reader.read();
                done = isDone;
                if (value) {
                    chunks.push(value);
                }
            }

            // We only delete the response once the entire body is consumed
            activeResponses.delete(id);

            // Concatenate all Uint8Arrays into one
            const concatenated = concatUint8Arrays(chunks);

			
            if (bodyAction === "json") {
                // Parse as JSON if requested
				
	            // Decode the concatenated Uint8Array to a string
	            const text = new TextDecoder().decode(concatenated);
                portManager.reply(port, { result: JSON.parse(text), id });
            } else if(bodyAction == "text") {
                // Send as text if requested
				
	            // Decode the concatenated Uint8Array to a string
	            const text = new TextDecoder().decode(concatenated);
                portManager.reply(port, { result: text, id });
            } else if(bodyAction == "blob") {
				var blob = new Blob([concatenated] , { type: 'application/octet-stream' })
				var url = await blobToDataURL(blob);
				portManager.reply(port, { result: url, id });
			}
        } else if (bodyAction === "read") {
            // For 'read', we handle chunks as they come in, without deleting the response prematurely
            const { done, value } = await reader.read();
			
            if (done) {
                activeResponses.delete(id);
                portManager.reply(port, { result: null, id });
            } else {
				var blob = new Blob([value] , { type: 'application/octet-stream' })
				var url = await blobToDataURL(blob);
			//	var url = URL.createObjectURL(blob)
				//console.log("Sending",blob,value,url);
                portManager.reply(port, { result: url, id });
            }
        }
    } catch (error) {
        portManager.reply(port, { error: error.stack, id });
    }
});

function concatUint8Arrays(arrays) {
    // Calculate the total length of the concatenated array
    let totalLength = arrays.reduce((acc, curr) => acc + curr.length, 0);

    // Create a new Uint8Array to hold the result
    let concatenated = new Uint8Array(totalLength);

    // Copy each array into the result array
    let offset = 0;
    arrays.forEach(array => {
        concatenated.set(array, offset);
        offset += array.length;
    });

    return concatenated;
}

function blobToDataURL(blob) {
	return new Promise(r => {
		var reader = new FileReader();
		reader.onload = function() {
			var dataUrl = reader.result;

			r(dataUrl);
		};
		reader.readAsDataURL(blob);
	})
}

function getCookieString(domain) {
    return new Promise(r => 
    chrome.cookies.getAll({domain}, f=> {
        var str = f.map(w=>
            w.name+"="+
            w.value+"; "
        ).join("");
        r({string: str, cookies: f})
    }))
}

