import { ChessRules } from "../chess/rules.js";
import { SimpleAI } from "../chess/ai.js";
import assert from "assert";

const hangingQueen = new ChessRules("4k3/8/8/8/8/8/4q3/4K2R w K - 0 1");
const ai = new SimpleAI(hangingQueen, 2);
const move = ai.makeMove();
assert.ok(move, "AI returns a move");
assert.equal(move.to, "e2", `AI should capture hanging queen, got ${move.from}${move.to}`);

console.log("ok - ai captures hanging queen");
console.log("all ai tests passed");
