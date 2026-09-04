# browser-chess

Browser 3D chess (Three.js + Vite). Factory work-in-progress toward a premium playable milestone — see `docs/STATUS.json` for honest critic scores (overall **6.5**, pass bar **8.5**).

## Run

```bash
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## Test / build

```bash
npm test
npm run build
```

Optional smoke (writes `docs/verify-last.json`):

```bash
node test/headless-smoke.mjs
```

## What's working

- Legal chess moves (castling, en passant, promotion, mate/stalemate) in `chess/rules.js`
- Lathe-profile pieces + board, OrbitControls, click-to-move
- Random-legal opponent AI, simple move/capture tones
- Promotion picker, game-over + restart overlays

## Known gaps (to 8.5)

- AAA / photography-grade piece materials and lighting
- Designed SFX (not oscillators)
- Stronger AI than random legal
- Headless Chrome screenshot verification harness
- Real GitHub PR publish (needs authenticated `gh`)

## Architecture

See `ARCHITECTURE.md` and `PRD`.
