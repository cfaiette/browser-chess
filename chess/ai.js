import { ChessRules } from "./rules.js";

const VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };

const PST = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  r: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  q: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  k: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
};

const OPENING = {
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1": ["e2e4", "d2d4", "g1f3", "c2c4"],
  "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1": ["e7e5", "c7c5", "e7e6", "c7c6"],
  "rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1": ["d7d5", "g8f6", "e7e6", "c7c5"],
  "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2": ["g1f3", "b1c3", "f1c4"],
  "rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2": ["g1f3", "b1c3", "d2d4"],
  "rnbqkb1r/pppppppp/5n2/8/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 1 2": ["c2c4", "g1f3", "b1c3"],
};

function pstValue(type, color, file, rank) {
  const table = PST[type];
  if (!table) return 0;
  const r = color === "white" ? 7 - rank : rank;
  return table[r][file];
}

function materialScore(chess) {
  let score = 0;
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = chess.board[rank][file];
      if (!piece) continue;
      const value = (VALUES[piece.type] || 0) + pstValue(piece.type, piece.color, file, rank);
      score += piece.color === "white" ? value : -value;
    }
  }
  const mobility = chess.allLegalMoves().length;
  score += chess.turn === "white" ? mobility * 2 : -mobility * 2;
  if (chess.isCheckmate()) {
    score += chess.turn === "white" ? -10000 : 10000;
  } else if (chess.inCheck()) {
    score += chess.turn === "white" ? -40 : 40;
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

function openingMove(chess) {
  const choices = OPENING[chess.fen()];
  if (!choices?.length) return null;
  const legal = new Set(chess.allLegalMoves().map((m) => m.from + m.to));
  const filtered = choices.filter((c) => legal.has(c));
  if (!filtered.length) return null;
  const pick = filtered[Math.floor(Math.random() * filtered.length)];
  return { from: pick.slice(0, 2), to: pick.slice(2, 4) };
}

function quietCaptures(chess) {
  return orderMoves(
    chess,
    chess.allLegalMoves().filter((m) => Boolean(chess.getPiece(m.to))),
  );
}

function quiesce(chess, alpha, beta, maximizingWhite, ply) {
  const stand = materialScore(chess);
  if (ply <= 0) return stand;
  if (maximizingWhite) {
    if (stand >= beta) return beta;
    alpha = Math.max(alpha, stand);
  } else {
    if (stand <= alpha) return alpha;
    beta = Math.min(beta, stand);
  }
  for (const move of quietCaptures(chess)) {
    const next = new ChessRules(chess.fen());
    if (!next.move(move.from, move.to, "q").ok) continue;
    const score = quiesce(next, alpha, beta, !maximizingWhite, ply - 1);
    if (maximizingWhite) {
      if (score >= beta) return beta;
      alpha = Math.max(alpha, score);
    } else {
      if (score <= alpha) return alpha;
      beta = Math.min(beta, score);
    }
  }
  return maximizingWhite ? alpha : beta;
}

function minimax(chess, depth, alpha, beta, maximizingWhite) {
  if (chess.isCheckmate() || chess.isStalemate()) {
    return { score: materialScore(chess), move: null };
  }
  if (depth === 0) {
    return { score: quiesce(chess, alpha, beta, maximizingWhite, 2), move: null };
  }
  const moves = orderMoves(chess, chess.allLegalMoves());
  if (!moves.length) return { score: materialScore(chess), move: null };

  let bestMove = moves[0];
  let bestScore = maximizingWhite ? -Infinity : Infinity;

  for (const move of moves) {
    const next = new ChessRules(chess.fen());
    const result = next.move(move.from, move.to, "q");
    if (!result.ok) continue;
    const { score } = minimax(next, depth - 1, alpha, beta, !maximizingWhite);
    if (maximizingWhite) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, score);
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
      beta = Math.min(beta, score);
    }
    if (beta <= alpha) break;
  }
  return { score: bestScore, move: bestMove };
}

export class SimpleAI {
  constructor(chess, depth = 3) {
    this.chess = chess;
    this.depth = depth;
  }

  makeMove() {
    const book = openingMove(this.chess);
    if (book) return book;
    const maximizingWhite = this.chess.turn === "white";
    const { move } = minimax(this.chess, this.depth, -Infinity, Infinity, maximizingWhite);
    return move || null;
  }
}
