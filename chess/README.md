# chess/

Authoritative rules + AI helpers.

- `rules.js` — legal moves, castling, EP, promotion, mate/stalemate, FEN
- `ai.js` — depth-3 minimax, PST, opening book, quiescence
- `index.js` — ARCHITECTURE public API (`init`, `showcase`, `update`, `on`, `off`, `destroy`)

Does not render. Emits `chess:move-executed` via the module bus when using `move()`.
