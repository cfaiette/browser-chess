import { createBus } from "../lib/bus.js";

const bus = createBus("animation");
let active = null;

export function init() {
  active = null;
  bus.emit("ready", {});
  return api;
}

export function showcase(container) {
  if (container) container.textContent = "animation: cubic ease piece lift (0.22s)";
}

export function update(dt = 1 / 60) {
  if (!active) return null;
  active.t += dt;
  const u = Math.min(1, active.t / active.dur);
  const e = 1 - (1 - u) ** 3;
  active.mesh.position.x = active.x0 + (active.x1 - active.x0) * e;
  active.mesh.position.z = active.z0 + (active.z1 - active.z0) * e;
  active.mesh.position.y = active.yBase + Math.sin(Math.PI * e) * active.lift;
  if (u >= 1) {
    const done = active.after;
    active = null;
    bus.emit("finished", {});
    done?.();
    return "finished";
  }
  return "running";
}

export function on(event, handler) {
  return bus.on(event, handler);
}

export function off(event, handler) {
  return bus.off(event, handler);
}

export function destroy() {
  active = null;
  bus.clear();
}

export function liftMove(mesh, from, to, opts = {}) {
  active = {
    mesh,
    x0: from.x,
    z0: from.z,
    x1: to.x,
    z1: to.z,
    yBase: opts.yBase ?? 0.06,
    lift: opts.lift ?? 0.35,
    t: 0,
    dur: opts.dur ?? 0.22,
    after: opts.after ?? null,
  };
  bus.emit("started", { from, to });
  return active;
}

export function isBusy() {
  return Boolean(active);
}

const api = { init, showcase, update, on, off, destroy, liftMove, isBusy };
