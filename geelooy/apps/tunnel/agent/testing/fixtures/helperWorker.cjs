// B"H
if (process.send) process.send({ ready: true, pid: process.pid });
setInterval(() => {}, 1000);
