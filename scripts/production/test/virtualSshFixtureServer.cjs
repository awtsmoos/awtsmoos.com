//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Real TCP protocol fixture for canonical virtual-SSH activation tests.
 * @description
 * The Awtsmoos lets tests witness a real socket instead of a painted `ss` illusion;
 * Awtsmoos.com reads the current banner from a file on every connection, so one living
 * child process can reveal valid SSH or wrong-protocol failure while the tests rhyme.
 */
const fs = require("node:fs");
const net = require("node:net");

const requestedPort = Number(process.argv[2] || 0);
const readyFile = process.argv[3];
const bannerFile = process.argv[4];

if (!readyFile || !bannerFile) {
	throw new Error("virtual_ssh_fixture_arguments_missing");
}

const server = net.createServer(socket => {
	const banner = fs.readFileSync(bannerFile, "utf8").trim();
	socket.end(`${banner}\r\n`);
});

server.listen(requestedPort, "127.0.0.1", () => {
	const address = server.address();
	fs.writeFileSync(readyFile, JSON.stringify({
		host: "127.0.0.1",
		port: address.port
	}));
});

function closeFixture() {
	server.close(() => {
		process.exit(0);
	});
}

process.on("SIGTERM", closeFixture);
process.on("SIGINT", closeFixture);
