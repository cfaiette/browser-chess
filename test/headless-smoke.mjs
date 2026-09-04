import { ChessRules } from '../chess/rules.js';
import { writeFileSync } from 'fs';

const verifyLastFile = 'docs/verify-last.json';

// Add more FEN positions as needed
const testPositions = [
    "rnbqkb1r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    "rnbqkb1r/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1"  // Example additional position
];

let results = [];

for (const fen of testPositions) {
    const chess = new ChessRules(fen);
    results.push({ fen, legalMoves: chess.allLegalMoves(chess.turn) });
}

writeFileSync(verifyLastFile, JSON.stringify(results, null, 2));
console.log('Verification results saved to', verifyLastFile);