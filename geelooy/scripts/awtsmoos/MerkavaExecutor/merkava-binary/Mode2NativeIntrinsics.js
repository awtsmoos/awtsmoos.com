// B"H
/**
 * Internal native-JS intrinsic table for MODE2.
 * This is not delegation to host objects; each entry is a deterministic
 * runtime function the VM can address by compact id.
 */
const INTRINSICS = Object.freeze([
  'Array.push','Array.pop','Array.map','Array.filter','Array.reduce','Array.includes','Array.join','Array.slice',
  'String.split','String.includes','String.startsWith','String.endsWith','String.slice','String.toUpperCase','String.toLowerCase','String.trim',
  'Object.keys','Object.values','Object.entries','Object.assign','Object.create','Object.hasOwn',
  'Map.new','Map.set','Map.get','Map.has','Map.delete','Map.size','Set.new','Set.add','Set.has','Set.delete','Set.size',
  'TypedArray.u8','TypedArray.get','TypedArray.set','DataView.u16le','Math.max','Math.min','Math.floor','Math.ceil','JSON.parse','JSON.stringify'
]);
const INTRINSIC_ID = Object.freeze(Object.fromEntries(INTRINSICS.map((name, id) => [name, id])));

function callMode2Intrinsic(idOrName, receiver, ...args) {
  const name = typeof idOrName === 'number' ? INTRINSICS[idOrName] : idOrName;
  switch (name) {
    case 'Array.push': return (receiver.push(...args), receiver.length);
    case 'Array.pop': return receiver.pop();
    case 'Array.map': return receiver.map(args[0]);
    case 'Array.filter': return receiver.filter(args[0]);
    case 'Array.reduce': return args.length > 1 ? receiver.reduce(args[0], args[1]) : receiver.reduce(args[0]);
    case 'Array.includes': return receiver.includes(args[0]);
    case 'Array.join': return receiver.join(args[0] ?? ',');
    case 'Array.slice': return receiver.slice(args[0], args[1]);
    case 'String.split': return String(receiver).split(args[0]);
    case 'String.includes': return String(receiver).includes(args[0]);
    case 'String.startsWith': return String(receiver).startsWith(args[0]);
    case 'String.endsWith': return String(receiver).endsWith(args[0]);
    case 'String.slice': return String(receiver).slice(args[0], args[1]);
    case 'String.toUpperCase': return String(receiver).toUpperCase();
    case 'String.toLowerCase': return String(receiver).toLowerCase();
    case 'String.trim': return String(receiver).trim();
    case 'Object.keys': return Object.keys(receiver);
    case 'Object.values': return Object.values(receiver);
    case 'Object.entries': return Object.entries(receiver);
    case 'Object.assign': return Object.assign(receiver, ...args);
    case 'Object.create': return Object.create(receiver || null);
    case 'Object.hasOwn': return Object.prototype.hasOwnProperty.call(receiver, args[0]);
    case 'Map.new': return new Map(args[0]);
    case 'Map.set': return (receiver.set(args[0], args[1]), receiver);
    case 'Map.get': return receiver.get(args[0]);
    case 'Map.has': return receiver.has(args[0]);
    case 'Map.delete': return receiver.delete(args[0]);
    case 'Map.size': return receiver.size;
    case 'Set.new': return new Set(args[0]);
    case 'Set.add': return (receiver.add(args[0]), receiver);
    case 'Set.has': return receiver.has(args[0]);
    case 'Set.delete': return receiver.delete(args[0]);
    case 'Set.size': return receiver.size;
    case 'TypedArray.u8': return new Uint8Array(args[0]);
    case 'TypedArray.get': return receiver[args[0]];
    case 'TypedArray.set': return (receiver[args[0]] = args[1], args[1]);
    case 'DataView.u16le': return new DataView(receiver.buffer || receiver).getUint16(args[0], true);
    case 'Math.max': return Math.max(receiver, ...args);
    case 'Math.min': return Math.min(receiver, ...args);
    case 'Math.floor': return Math.floor(receiver);
    case 'Math.ceil': return Math.ceil(receiver);
    case 'JSON.parse': return JSON.parse(receiver);
    case 'JSON.stringify': return JSON.stringify(receiver);
    default: throw new Error(`Unknown MODE2 intrinsic: ${name}`);
  }
}
module.exports = { INTRINSICS, INTRINSIC_ID, callMode2Intrinsic };
