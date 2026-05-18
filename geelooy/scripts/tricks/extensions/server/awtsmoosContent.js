//B"H
console.log("HI")
class PortManager {
    constructor() {
        this.id = "BH_WOW_" + Date.now(); // Unique ID for the connection
        this.port = null; // Holds the port reference
        this.retryInterval = 1000; // Time (ms) to wait before retrying connection
        this.maxRetries = 5; // Max number of retries before giving up
        this.retryCount = 0; // Counter to track retries
        this.init();
    }

    // Initialize the connection process and message listeners
    init() {
        this.connect(); // First attempt to connect to the background
        this.listenForPageMessages(); // Start listening for messages from the webpage
    }

    // Establish the connection to the background script
    connect() {
        console.log("Connecting to the background with id:", this.id);
        this.port = chrome.runtime.connect({ name: this.id });

        // Listen for incoming messages from the background
        this.port.onMessage.addListener(this.onMessageReceived.bind(this));

        // Handle port disconnection
        this.port.onDisconnect.addListener(this.onDisconnect.bind(this));

        // Send an initial message to the background
       // this.sendMessage({ action: "customEvent", data: "initial data" });
    }

    // Listen for messages from the page (content script)
    listenForPageMessages() {
        onmessage = (e) => {
            try {
                // Forward the page's message to the background
                const data = e?.data;
               // console.log("Message from page:", data);
                this.sendMessage(data);
            } catch (error) {
                console.error("Error while processing message from page:", error);
            }
        };
    }

    // Handle received messages from the background
    onMessageReceived(msg) {
       // console.log("Message received from background:", msg);

        // Forward the message to the page (content script)
        postMessage(msg);
    }

    // Send a message to the background script (if the port is open)
    sendMessage(message) {
		try {
	        if (this.port) {
	            //console.log("Sending message to background:", message);
	            this.port.postMessage(message);
	        } else {
	            console.warn("Port is closed or disconnected, unable to send message.",this.port);
	            // Optionally, handle the situation if the port is disconnected
	        }
		} catch(e) {
			console.log("Awtsmoos Port Error, trying to reconnect",e)
			try {
				this.connect()
				this.port.postMessage(message);
			} catch(e) {
				console.log("Tried, nothing..");
			}

		}
    }

    // Handle port disconnection and try reconnecting
    onDisconnect() {
   //     console.log("Port disconnected.");
        this.retryCount++;
        if (this.retryCount <= this.maxRetries) {
            console.log(`Reconnecting... Attempt ${this.retryCount}/${this.maxRetries}`);
            setTimeout(() => this.connect(), this.retryInterval); // Retry after the interval
        } else {
            console.error("Max retries reached. Could not reconnect.");
        }
    }
}

// Create a new instance of PortManager which will automatically manage the connection
const portManager = new PortManager();
var f = document.createElement("script")
f.src = chrome.runtime.getURL("./jected.js")
document.head.appendChild(f);