// B"H
const childProcess = require("node:child_process");
process.on("SIGTERM", () => {});
const child = childProcess.spawn(process.execPath, ["-e", "process.on('SIGTERM',()=>{});setInterval(()=>{},1000)"], {
	stdio: "ignore"
});
setTimeout(() => {
	console.log(JSON.stringify({ ready: true, parentPid: process.pid, childPid: child.pid }));
}, 150);
setInterval(() => {}, 1000);
