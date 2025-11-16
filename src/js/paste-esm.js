// ES module entry for Paste.js
import "./paste.js";

const Paste =
  (typeof window !== "undefined" && window.paste) ||
  (typeof globalThis !== "undefined" && globalThis.paste);

if (!Paste) {
  throw new Error("Paste.js global object not found after importing classic build.");
}

export default Paste;

// Named exports
export const dom = Paste.dom;
export const util = Paste.util;
export const io = Paste.io;
export const has = Paste.has;
export const storage = Paste.storage;
export const event = Paste.event;
export const guid = Paste.guid;
export const speed = Paste.speed;
export const lru = Paste.lru;
export const oop = Paste.oop;
