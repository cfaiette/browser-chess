import assert from "node:assert/strict";
import { ChessRules, START_FEN } from "../chess/rules.js";

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`fail - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

test("loads starting fen", () => {
  const game = new ChessRules(START_FEN);
  assert.equal(game.turn, "white");
  assert.equal(game.getPiece("e2").type, "p");
  assert.equal(game.getPiece("e8").color, "black");
});

test("allows normal pawn and knight development", () => {
  const game = new ChessRules();
  assert.ok(game.move("e2", "e4").ok);
  assert.ok(game.move("e7", "e5").ok);
  assert.ok(game.move("g1", "f3").ok);
});

test("rejects illegal moves", () => {
  const game = new ChessRules();
  assert.equal(game.move("e2", "e5").ok, false);
  assert.equal(game.move("a1", "a3").ok, false);
});

test("detects checkmate scholar pattern", () => {
  const game = new ChessRules();
  assert.ok(game.move("e2", "e4").ok);
  assert.ok(game.move("e7", "e5").ok);
  assert.ok(game.move("d1", "h5").ok);
  assert.ok(game.move("b8", "c6").ok);
  assert.ok(game.move("f1", "c4").ok);
  assert.ok(game.move("g8", "f6").ok);
  const mate = game.move("h5", "f7");
  assert.ok(mate.ok);
  assert.equal(mate.checkmate, true);
});

test("supports castling when path clear", () => {
  const game = new ChessRules("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
  assert.ok(game.move("e1", "g1").ok);
  assert.equal(game.getPiece("g1").type, "k");
  assert.equal(game.getPiece("f1").type, "r");
});

test("supports en passant", () => {
  const game = new ChessRules("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1");
  assert.ok(game.move("e5", "d6").ok);
  assert.equal(game.getPiece("d5"), null);
  assert.equal(game.getPiece("d6").type, "p");
});

test("supports promotion", () => {
  const game = new ChessRules("4k3/P7/8/8/8/8/8/4K3 w - - 0 1");
  assert.ok(game.move("a7", "a8", "q").ok);
  assert.equal(game.getPiece("a8").type, "q");
});

if (!process.exitCode) {
  console.log("all chess rule tests passed");
}
