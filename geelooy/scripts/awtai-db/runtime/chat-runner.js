// B"H
const { AwtaiFile } = require('../storage/awtai-file.js');
const { TensorIndex } = require('./tensor-index.js');
const { Scheduler } = require('./scheduler.js');
const { PacketReader } = require('./packet-reader.js');
const { Session } = require('./session.js');
const { GgufTokenizer } = require('../tokenizer/gguf-tokenizer.js');
const { dequant } = require('../math/dequant.js');

/**
 * B"H
 * The chat runner is the little doorway where the disk opens its eye.
 * It does not pretend to be a completed oracle. It walks the true path:
 * open AWTAI-DB, read the manifest, tokenize the human breath, schedule
 * packets, read tensor bytes by range, and enter the first math gate.
 */
function runChatOnce(path, prompt) {
  const file = new AwtaiFile(path);
  try {
    const index = new TensorIndex(file.manifest);
    const scheduler = new Scheduler(file.manifest);
    const reader = new PacketReader(file, index);
    const tokenizer = new GgufTokenizer(file.manifest.metadata);
    const session = new Session(prompt);

    session.tokens = tokenizer.encode(prompt);
    session.record({
      event: 'tokenized',
      count: session.tokens.length,
      firstTokens: session.tokens.slice(0, 16)
    });
    session.record({ event: 'schedule-preview', plan: scheduler.plan(6) });

    const firstPacket = scheduler.next();
    if (firstPacket) {
      const packet = reader.readPacket(firstPacket);
      session.record({
        event: 'packet-read',
        packetId: firstPacket.id,
        tensors: packet.map(item => ({ name: item.tensor.name, bytes: item.bytes.length }))
      });
    }

    const embed = index.role('embed');
    if (!embed) throw new Error("B'H no embedding tensor found");

    const raw = file.tensorBytes(embed);
    session.record({
      event: 'read-embedding',
      tensor: embed.name,
      bytes: raw.length,
      type: embed.type
    });

    const elements = embed.dims.reduce((a, b) => a * b, 1);
    const floats = dequant(raw, embed.type, Math.min(elements, 1024));
    session.record({ event: 'dequant-preview', values: Array.from(floats.slice(0, 8)) });

    return {
      ok: true,
      reply: "B'H runtime reached embedding dequant preview; full transformer loop is next.",
      session,
      manifest: {
        tensors: file.manifest.tensors.length,
        packets: file.manifest.packets.length
      }
    };
  } finally {
    file.close();
  }
}

module.exports = { runChatOnce };
