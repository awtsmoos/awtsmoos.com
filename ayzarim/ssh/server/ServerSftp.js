//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Streaming SFTP-v3 dispatcher with capability-aware subsystem admission.
 * @description
 * The Awtsmoos lets filesystem actions remain ordered while response bytes wait
 * for the client's SSH window. Awtsmoos.com asks permission before SFTP is accepted,
 * then keeps packet dispatch and network flow bounded, truthful, and in rhyme.
 */
const ChannelWire = require("./ChannelWire.js");
const { SftpFileOps } = require("./SftpFileOps.js");
const { SftpHandles } = require("./SftpHandles.js");
const { SftpPathOps } = require("./SftpPathOps.js");
const Status = require("./SftpStatus.js");
const Wire = require("./SftpWire.js");
const { reader } = require("./Wire.js");

const MAX_PACKET_BYTES = 2 * 1024 * 1024;

class ServerSftp {
	constructor(protocol, backend) {
		this.protocol = protocol;
		this.backend = backend;
	}

	canStart(channel) {
		return this.backend.canSftp?.(channel.session) !== false;
	}

	start(channel) {
		channel.mode = "sftp";
		channel.sftpBuffer = Buffer.alloc(0);
		channel.sftpQueue = Promise.resolve();
		channel.sftpHandles = new SftpHandles();
		channel.sftpFiles = new SftpFileOps(this.backend, channel.sftpHandles);
		channel.sftpPaths = new SftpPathOps(this.backend, channel.sftpHandles);
	}

	feed(channel, incoming) {
		channel.sftpBuffer = Buffer.concat([channel.sftpBuffer, Buffer.from(incoming)]);
		while (channel.sftpBuffer.length >= 4) {
			const length = channel.sftpBuffer.readUInt32BE(0);
			if (length < 1 || length > MAX_PACKET_BYTES) {
				throw new Error("invalid_sftp_packet_length");
			}
			if (channel.sftpBuffer.length < length + 4) {
				break;
			}
			const packet = channel.sftpBuffer.subarray(4, length + 4);
			channel.sftpBuffer = channel.sftpBuffer.subarray(length + 4);
			channel.sftpQueue = channel.sftpQueue
				.then(() => this.handlePacket(channel, packet))
				.catch(error => this.protocol._debug?.(`SFTP request error: ${error.message}`));
		}
		return channel.sftpQueue;
	}

	async handlePacket(channel, packet) {
		const type = packet[0];
		const stream = reader(packet);
		if (type === Wire.TYPE.INIT) {
			stream.readUInt32BE();
			this.queueSend(channel, Wire.version(3));
			return;
		}
		const id = stream.readUInt32BE();
		if (id === undefined) {
			throw new Error("missing_sftp_request_id");
		}
		try {
			this.queueSend(channel, await this.dispatch(channel, type, id, stream));
		} catch (error) {
			this.queueSend(channel, Status.forError(id, error));
		}
	}

	async dispatch(channel, type, id, stream) {
		const files = channel.sftpFiles;
		const paths = channel.sftpPaths;
		const session = channel.session;
		if (type === Wire.TYPE.OPEN) return files.open(id, stream, session);
		if (type === Wire.TYPE.CLOSE) return files.close(id, stream);
		if (type === Wire.TYPE.READ) return files.read(id, stream);
		if (type === Wire.TYPE.WRITE) return files.write(id, stream);
		if (type === Wire.TYPE.FSTAT) return files.fstat(id, stream);
		if (type === Wire.TYPE.STAT || type === Wire.TYPE.LSTAT) return paths.stat(id, stream, session);
		if (type === Wire.TYPE.OPENDIR) return paths.opendir(id, stream, session);
		if (type === Wire.TYPE.READDIR) return paths.readdir(id, stream);
		if (type === Wire.TYPE.REMOVE) return paths.removeFile(id, stream, session);
		if (type === Wire.TYPE.RMDIR) return paths.rmdir(id, stream, session);
		if (type === Wire.TYPE.MKDIR) return paths.mkdir(id, stream, session);
		if (type === Wire.TYPE.REALPATH) return paths.realpath(id, stream, session);
		if (type === Wire.TYPE.RENAME) return paths.rename(id, stream, session);
		return Wire.status(id, Wire.STATUS.OP_UNSUPPORTED, `unsupported request ${type}`);
	}

	async dispose(channel) {
		if (!channel.sftpHandles) {
			return;
		}
		await channel.sftpQueue?.catch?.(() => {});
		await channel.sftpFiles?.flushAll?.();
		channel.sftpHandles.clear();
		channel.sftpBuffer = Buffer.alloc(0);
	}

	queueSend(channel, packet) {
		ChannelWire.data(this.protocol, channel, packet)
			.catch(error => this.protocol._debug?.(`SFTP response dropped: ${error.message}`));
	}
}

module.exports = { ServerSftp };
