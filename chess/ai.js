export class SimpleAI {
    constructor(chess) {
        this.chess = chess;
    }

    makeMove() {
        const legalMoves = this.chess.allLegalMoves(this.chess.turn);
        const randomIndex = Math.floor(Math.random() * legalMoves.length);
        return legalMoves[randomIndex];
    }
}