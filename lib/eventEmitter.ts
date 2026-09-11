import { EventEmitter } from "events";

// In development, Next.js hot-reloading can cause multiple instances of the emitter,
// so we store it on the global object to keep a single instance.
const globalForEmitter = global as unknown as { emitter: EventEmitter };

export const eventEmitter = globalForEmitter.emitter || new EventEmitter();

// Increase max listeners if many displays are connected
eventEmitter.setMaxListeners(50);

if (process.env.NODE_ENV !== "production") {
  globalForEmitter.emitter = eventEmitter;
}
