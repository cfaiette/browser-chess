import { ChessRules } from "./rules.js";

const VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

function materialScore(chess) {
  let score = 0;
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = chess.board[rank][file];
      if (!piece) continue;
      const value = VALUES[piece.type] || 0;
      score += piece.color === "white" ? value : -value;
    }
  }
  if (chess.isCheckmate()) {
    score += chess.turn === "white" ? -10000 : 10000;
  } else if (chess.inCheck()) {
    score += chess.turn === "white" ? -35 : 35;
  }
  return score;
}

function orderMoves(chess, moves) {
  return moves
    .map((move) => {
      const target = chess.getPiece(move.to);
      const capture = target ? VALUES[target.type] || 0 : 0;
      return { move, capture };
    })
    .sort((a, b) => b.capture - a.capture)
    .map((entry) => entry.move);
}

function minimax(chess, depth, maximizingWhite) {
  if (depth === 0 || chess.isCheckmate() || chess.isStalemate()) {
    return { score: materialScore(chess), move: null };
  }
  const moves = orderMoves(chess, chess.allLegalMoves());
  if (!moves.length) return { score: materialScore(chess), move: null };

  let bestMove = moves[0];
  let bestScore = maximizingWhite ? -Infinity : Infinity;

  for (const move of moves) {
    const next = new ChessRules(chess.fen());
    const result = next.move(move.from, move.to, "q");
    if (!result.ok) continue;
    const { score } = minimax(next, depth - 1, !maximizingWhite);
    if (maximizingWhite ? score > bestScore : score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return { score: bestScore, move: bestMove };
}

export class SimpleAI {
  constructor(chess, depth = 2) {
    this.chess = chess;
    this.depth = depth;
  }

  makeMove() {
    const maximizingWhite = this.chess.turn === "white";
    const { move } = minimax(this.chess, this.depth, maximizingWhite);
    return move || null;
  }
}
