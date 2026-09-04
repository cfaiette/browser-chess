// Basic AI implementation

export function minimalAI(board, color) {
  const legalMoves = board.allLegalMoves(color);
  if (legalMoves.length === 0) return null;
  return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}
