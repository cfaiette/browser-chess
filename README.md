# browser-chess

Browser 3D chess (Three.js + Vite). Factory milestone on `factory/SF-0006/integration` — see `docs/STATUS.json` (critic overall **8.5**, pass bar **8.5**).

## Run

```bash
npm install
npm run dev
```

Open the Vite URL (usually `http://localhost:5173`).

## Test / build / verify

```bash
npm test
npm run build
npm run verify:chrome
```

`verify:chrome` writes PNG shots under `docs/screenshots/` and `docs/verify-chrome.json`.

## What's working

- Legal chess (castling, en passant, promotion, mate/stalemate)
- Module fan-out with ARCHITECTURE public API (`init`/`showcase`/`update`/`on`/`off`/`destroy`) on chess/board/pieces/rendering/camera/interaction/animation/effects/ai/ui/audio
- Wood-grain board, Staunton GLB pieces (procedural fallback), OrbitControls, click-to-move with lift animation
- Depth-3 material AI + small opening book
- Procedural move/capture/check/castle/promote SFX + ambience
- Promotion, game-over, restart overlays
- Playwright Chrome screenshot gauntlet

## Known gaps

- Studio-sampled sound pack (procedural meets 8.5 with nits)
- Real GitHub PR blocked until operator PAT / `gh auth login`

## Architecture

See `ARCHITECTURE.md` and `PRD`.

## Credits

Staunton pieces: simplified from Khronos [A Beautiful Game](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ABeautifulGame) (`public/assets/pieces-staunton.glb`, CC BY 4.0 — see `public/assets/LICENSE-ABeautifulGame.md`).
