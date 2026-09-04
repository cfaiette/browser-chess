# chess module

Authoritative chess state logic: move generation, FEN/PGN parsing, rules engine, state emission.

- Exports: `init`, `update`, `on`, `off`, `destroy` (see ARCHITECTURE.md for contracts)
- Emits: `chess:move-executed`, `chess:state-changed`, `chess:illegal-move`, etc.
- No UI or rendering code here.
