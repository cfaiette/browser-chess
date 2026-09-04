const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

function squareToCoords(square) {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  if (file < 0 || file > 7 || rank < 0 || rank > 7) {
    throw new Error(`invalid square ${square}`);
  }
  return { file, rank };
}

function coordsToSquare(file, rank) {
  return `${String.fromCharCode(97 + file)}${rank + 1}`;
}

function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function opposite(color) {
  return color === "white" ? "black" : "white";
}

function pieceAt(board, square) {
  const { file, rank } = squareToCoords(square);
  return board[rank][file];
}

function setPiece(board, square, piece) {
  const { file, rank } = squareToCoords(square);
  board[rank][file] = piece;
}

function findKing(board, color) {
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = board[rank][file];
      if (piece && piece.type === "k" && piece.color === color) {
        return coordsToSquare(file, rank);
      }
    }
  }
  return null;
}

function isAttacked(board, square, byColor) {
  for (let rank = 0; rank < 8; rank += 1) {
    for (let file = 0; file < 8; file += 1) {
      const piece = board[rank][file];
      if (!piece || piece.color !== byColor) continue;
      const from = coordsToSquare(file, rank);
      const moves = pseudoMoves(board, from, piece, null, true);
      if (moves.includes(square)) return true;
    }
  }
  return false;
}

function rayMoves(board, from, piece, deltas) {
  const { file, rank } = squareToCoords(from);
  const out = [];
  for (const [df, dr] of deltas) {
    let f = file + df;
    let r = rank + dr;
    while (f >= 0 && f < 8 && r >= 0 && r < 8) {
      const target = board[r][f];
      const sq = coordsToSquare(f, r);
      if (!target) {
        out.push(sq);
      } else {
        if (target.color !== piece.color) out.push(sq);
        break;
      }
      f += df;
      r += dr;
    }
  }
  return out;
}

function hopMoves(board, from, piece, hops) {
  const { file, rank } = squareToCoords(from);
  const out = [];
  for (const [df, dr] of hops) {
    const f = file + df;
    const r = rank + dr;
    if (f < 0 || f > 7 || r < 0 || r > 7) continue;
    const target = board[r][f];
    if (!target || target.color !== piece.color) out.push(coordsToSquare(f, r));
  }
  return out;
}

function pseudoMoves(board, from, piece, enPassant, forAttack = false) {
  const { file, rank } = squareToCoords(from);
  const type = piece.type.toLowerCase();
  if (type === "p") {
    const dir = piece.color === "white" ? 1 : -1;
    const start = piece.color === "white" ? 1 : 6;
    const out = [];
    if (!forAttack) {
      const one = rank + dir;
      if (one >= 0 && one < 8 && !board[one][file]) {
        out.push(coordsToSquare(file, one));
        const two = rank + dir * 2;
        if (rank === start && !board[two][file]) out.push(coordsToSquare(file, two));
      }
    }
    for (const df of [-1, 1]) {
      const f = file + df;
      const r = rank + dir;
      if (f < 0 || f > 7 || r < 0 || r > 7) continue;
      const sq = coordsToSquare(f, r);
      const target = board[r][f];
      if (forAttack || (target && target.color !== piece.color)) out.push(sq);
      if (!forAttack && enPassant === sq) out.push(sq);
    }
    return out;
  }
  if (type === "n") {
    return hopMoves(board, from, piece, [
      [1, 2],
      [2, 1],
      [2, -1],
      [1, -2],
      [-1, -2],
      [-2, -1],
      [-2, 1],
      [-1, 2],
    ]);
  }
  if (type === "b") {
    return rayMoves(board, from, piece, [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]);
  }
  if (type === "r") {
    return rayMoves(board, from, piece, [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]);
  }
  if (type === "q") {
    return rayMoves(board, from, piece, [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]);
  }
  if (type === "k") {
    return hopMoves(board, from, piece, [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ]);
  }
  return [];
}

export class ChessRules {
  constructor(fen = START_FEN) {
    this.loadFen(fen);
  }

  loadFen(fen) {
    const [placement, turn, castling, ep, half, full] = fen.trim().split(/\s+/);
    const board = Array.from({ length: 8 }, () => Array(8).fill(null));
    let rank = 7;
    let file = 0;
    for (const ch of placement) {
      if (ch === "/") {
        rank -= 1;
        file = 0;
        continue;
      }
      if (/\d/.test(ch)) {
        file += Number(ch);
        continue;
      }
      board[rank][file] = {
        type: ch.toLowerCase(),
        color: ch === ch.toUpperCase() ? "white" : "black",
      };
      file += 1;
    }
    this.board = board;
    this.turn = turn === "b" ? "black" : "white";
    this.castling = {
      whiteKing: castling.includes("K"),
      whiteQueen: castling.includes("Q"),
      blackKing: castling.includes("k"),
      blackQueen: castling.includes("q"),
    };
    this.enPassant = ep === "-" ? null : ep;
    this.halfmove = Number(half || 0);
    this.fullmove = Number(full || 1);
    this.history = [];
  }

  getPiece(square) {
    return pieceAt(this.board, square);
  }

  inCheck(color = this.turn) {
    const king = findKing(this.board, color);
    if (!king) return false;
    return isAttacked(this.board, king, opposite(color));
  }

  legalMoves(from) {
    const piece = pieceAt(this.board, from);
    if (!piece || piece.color !== this.turn) return [];
    const candidates = pseudoMoves(this.board, from, piece, this.enPassant);
    if (piece.type === "k") {
      candidates.push(...this.castlingMoves(from, piece));
    }
    return candidates.filter((to) => {
      const next = this.previewMove(from, to);
      return !isAttacked(next.board, findKing(next.board, piece.color), opposite(piece.color));
    });
  }

  castlingMoves(from, piece) {
    const out = [];
    if (this.inCheck(piece.color)) return out;
    const rank = piece.color === "white" ? 0 : 7;
    const enemy = opposite(piece.color);
    if (from !== coordsToSquare(4, rank)) return out;
    const rights =
      piece.color === "white"
        ? { king: this.castling.whiteKing, queen: this.castling.whiteQueen }
        : { king: this.castling.blackKing, queen: this.castling.blackQueen };
    if (rights.king) {
      if (!pieceAt(this.board, coordsToSquare(5, rank)) && !pieceAt(this.board, coordsToSquare(6, rank))) {
        if (
          !isAttacked(this.board, coordsToSquare(5, rank), enemy) &&
          !isAttacked(this.board, coordsToSquare(6, rank), enemy)
        ) {
          out.push(coordsToSquare(6, rank));
        }
      }
    }
    if (rights.queen) {
      if (
        !pieceAt(this.board, coordsToSquare(3, rank)) &&
        !pieceAt(this.board, coordsToSquare(2, rank)) &&
        !pieceAt(this.board, coordsToSquare(1, rank))
      ) {
        if (
          !isAttacked(this.board, coordsToSquare(3, rank), enemy) &&
          !isAttacked(this.board, coordsToSquare(2, rank), enemy)
        ) {
          out.push(coordsToSquare(2, rank));
        }
      }
    }
    return out;
  }

  previewMove(from, to, promotion = "q") {
    const board = cloneBoard(this.board);
    const piece = pieceAt(board, from);
    const { file: tf, rank: tr } = squareToCoords(to);
    const { file: ff, rank: fr } = squareToCoords(from);
    let captured = pieceAt(board, to);
    if (piece.type === "p" && this.enPassant === to && !captured) {
      const capRank = piece.color === "white" ? tr - 1 : tr + 1;
      captured = board[capRank][tf];
      board[capRank][tf] = null;
    }
    setPiece(board, from, null);
    let placed = { ...piece };
    if (piece.type === "p" && (tr === 7 || tr === 0)) {
      placed = { type: promotion, color: piece.color };
    }
    setPiece(board, to, placed);
    if (piece.type === "k" && Math.abs(tf - ff) === 2) {
      if (tf === 6) {
        setPiece(board, coordsToSquare(7, fr), null);
        setPiece(board, coordsToSquare(5, fr), { type: "r", color: piece.color });
      } else if (tf === 2) {
        setPiece(board, coordsToSquare(0, fr), null);
        setPiece(board, coordsToSquare(3, fr), { type: "r", color: piece.color });
      }
    }
    return { board, captured };
  }

  move(from, to, promotion = "q") {
    const legal = this.legalMoves(from);
    if (!legal.includes(to)) {
      return { ok: false, reason: "illegal" };
    }
    const piece = pieceAt(this.board, from);
    const { board, captured } = this.previewMove(from, to, promotion);
    const { file: ff, rank: fr } = squareToCoords(from);
    const { file: tf, rank: tr } = squareToCoords(to);
    this.history.push({
      from,
      to,
      piece,
      captured,
      fenBefore: this.fen(),
    });
    this.board = board;
    if (piece.type === "k") {
      if (piece.color === "white") {
        this.castling.whiteKing = false;
        this.castling.whiteQueen = false;
      } else {
        this.castling.blackKing = false;
        this.castling.blackQueen = false;
      }
    }
    if (piece.type === "r") {
      if (from === "a1") this.castling.whiteQueen = false;
      if (from === "h1") this.castling.whiteKing = false;
      if (from === "a8") this.castling.blackQueen = false;
      if (from === "h8") this.castling.blackKing = false;
    }
    this.enPassant =
      piece.type === "p" && Math.abs(tr - fr) === 2
        ? coordsToSquare(ff, (fr + tr) / 2)
        : null;
    this.halfmove = piece.type === "p" || captured ? 0 : this.halfmove + 1;
    if (this.turn === "black") this.fullmove += 1;
    this.turn = opposite(this.turn);
    return {
      ok: true,
      check: this.inCheck(),
      checkmate: this.isCheckmate(),
      stalemate: this.isStalemate(),
    };
  }

  allLegalMoves(color = this.turn) {
    const moves = [];
    for (let rank = 0; rank < 8; rank += 1) {
      for (let file = 0; file < 8; file += 1) {
        const piece = this.board[rank][file];
        if (!piece || piece.color !== color) continue;
        const from = coordsToSquare(file, rank);
        for (const to of this.legalMoves(from)) moves.push({ from, to });
      }
    }
    return moves;
  }

  isCheckmate() {
    return this.inCheck() && this.allLegalMoves().length === 0;
  }

  isStalemate() {
    return !this.inCheck() && this.allLegalMoves().length === 0;
  }

  fen() {
    const ranks = [];
    for (let rank = 7; rank >= 0; rank -= 1) {
      let empty = 0;
      let row = "";
      for (let file = 0; file < 8; file += 1) {
        const piece = this.board[rank][file];
        if (!piece) {
          empty += 1;
          continue;
        }
        if (empty) {
          row += String(empty);
          empty = 0;
        }
        const ch = piece.type;
        row += piece.color === "white" ? ch.toUpperCase() : ch;
      }
      if (empty) row += String(empty);
      ranks.push(row);
    }
    let castling = "";
    if (this.castling.whiteKing) castling += "K";
    if (this.castling.whiteQueen) castling += "Q";
    if (this.castling.blackKing) castling += "k";
    if (this.castling.blackQueen) castling += "q";
    if (!castling) castling = "-";
    return `${ranks.join("/")} ${this.turn === "white" ? "w" : "b"} ${castling} ${
      this.enPassant || "-"
    } ${this.halfmove} ${this.fullmove}`;
  }
}

export { START_FEN };
export default ChessRules;
