import assert from "assert";
import { renderWoodClick, renderThud, renderChime } from "../audio/moveCaptureAudio.js";

function peak(buf) {
  let max = 0;
  for (const v of buf) max = Math.max(max, Math.abs(v));
  return max;
}

const click = renderWoodClick(44100);
assert.ok(click.length > 1000, "click has samples");
assert.ok(peak(click) > 0.05, "click has energy");

const thud = renderThud(44100);
assert.ok(thud.length > 2000, "thud has samples");
assert.ok(peak(thud) > 0.05, "thud has energy");

const chime = renderChime(44100, [440, 660]);
assert.ok(chime.length > 3000, "chime has samples");
assert.ok(peak(chime) > 0.02, "chime has energy");

console.log("ok - procedural sfx buffers");
console.log("all audio tests passed");
