//B"H
const { startServer } = require("./server.cjs");
const server = startServer({ port: 39501, host: "127.0.0.1", targetOrigin: "https://chatgpt.com", verbose: false });
setTimeout(() => {}, 600000);
process.on("SIGTERM", () => server.close(() => process.exit(0)));
process.on("SIGINT", () => server.close(() => process.exit(0)));
