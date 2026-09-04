export function createBus(namespace) {
  const listeners = new Map();
  const keyOf = (event) => (event.includes(":") ? event : `${namespace}:${event}`);
  return {
    on(event, handler) {
      const key = keyOf(event);
      if (!listeners.has(key)) listeners.set(key, new Set());
      listeners.get(key).add(handler);
      return () => listeners.get(key)?.delete(handler);
    },
    off(event, handler) {
      listeners.get(keyOf(event))?.delete(handler);
    },
    emit(event, payload) {
      for (const handler of listeners.get(keyOf(event)) || []) handler(payload);
    },
    clear() {
      listeners.clear();
    },
  };
}
