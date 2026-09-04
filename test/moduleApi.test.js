import assert from "node:assert/strict";

const REQUIRED = ["init", "showcase", "update", "on", "off", "destroy"];

const modules = {
  chess: "../chess/index.js",
  board: "../board/index.js",
  pieces: "../pieces/index.js",
  rendering: "../rendering/index.js",
  camera: "../camera/index.js",
  interaction: "../interaction/index.js",
  animation: "../animation/index.js",
  effects: "../effects/index.js",
  ai: "../ai/index.js",
  ui: "../ui/index.js",
  audio: "../audio/index.js",
};

for (const [name, path] of Object.entries(modules)) {
  const mod = await import(path);
  for (const fn of REQUIRED) {
    assert.equal(typeof mod[fn], "function", `${name}.${fn} must be a function`);
  }
  const el = {
    text: null,
    set textContent(v) {
      this.text = v;
    },
    get textContent() {
      return this.text;
    },
  };
  mod.showcase(el);
  assert.ok(el.text && String(el.text).length > 0, `${name}.showcase should label itself`);
  console.log(`ok ${name} api`);
}

console.log("module API contract passed");
