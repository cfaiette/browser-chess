# ai/

Pluggable engine facade over `chess/ai.js` SimpleAI. Suggests moves only — never mutates chess state itself beyond calling into a provided game.

Public API: `init({ chess })`, `showcase`, `update`, `on`, `off`, `destroy`, `suggestMove`.
