# browser-chess

Browser 3D chess (Three.js + Vite). Factory milestone on `factory/SF-0006/integration` — see `docs/STATUS.json` for honest critic scores (overall **~7.9**, pass bar **8.5**).

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
- Wood-grain board, clearcoat pieces, sculpted knights, OrbitControls, click-to-move with lift animation
- Depth-3 material AI + small opening book
- Procedural move/capture/check/castle/promote SFX
- Promotion, game-over, restart overlays
- Playwright Chrome screenshot gauntlet

## Known gaps (to 8.5)

- Scanned Staunton / photography-grade PBR assets
- Studio-sampled sound pack
- Real GitHub PR (`gh auth login` or authorize the machine SSH key)

## Architecture

See `ARCHITECTURE.md` and `PRD`.

## Credits

Staunton pieces: simplified from Khronos [A Beautiful Game](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/ABeautifulGame) (`public/assets/pieces-staunton.glb`, CC BY 4.0 — see `public/assets/LICENSE-ABeautifulGame.md`).
