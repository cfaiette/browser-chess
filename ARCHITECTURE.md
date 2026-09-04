# ARCHITECTURE.md

## Subsystem Layout

Project is structured by subsystems, each in its own folder at the top level:

- **chess/**: Core chess rules, FEN, PGN, move-gen, state engine (authoritative game state)
- **board/**: Visual 3D chessboard (geometry, positioning, PBR material, squares, notation)
- **pieces/**: 3D Staunton models, materials, instancing strategy, final geometry only (never programmer art)
- **rendering/**: Three.js bootstrap, renderer, scene-graph, main render/update loop, postprocessing FX, performance tracking
- **camera/**: Cinematic and player-controlled cameras, movement interpolation, cutscenes, replays
- **interaction/**: Mouse/touch picking, move selection, drag/drop, hover/click, UI-to-game wiring
- **animation/**: Piece/board/camera animations, transitions, timing, visual-only (must accept state from chess/interaction)
- **effects/**: Lighting, shadows, procedural/gloss/metalness, win/gameover FX, particle systems
- **ai/**: Engine, search, move-gen, evaluation, pluggable difficulty
- **ui/**: All 2D/HTML overlays (move history, timers, dialogs, settings, FEN import/export)
- **audio/**: SFX, music, 3D positional, state-linked, PBR-aware spatial cues
- **test/**: Automation harness, headless snapshot orchestration, log/metrics writer, module showcase mode runner
- **docs/**: Status tracking and documentation, including STATUS.json, bug/score history

## Shared Game-State Model
- Authoritative chess state is in `chess/`, emitting events consumed by all other modules
- Shared state is a serializable JS object with board positions, turn, history, timer(s), etc
- Explicit snapshot/restore for determinism and inspector tools
- No write access to authoritative state from outside `chess/`; updates only via defined chess API

## Modules: Public API and Events
Each subsystem folder:<ul>
<li>Contains one entrypoint file (e.g. board/index.js) exposing a public namespace</li>
<li>Public API (example signature, may be expanded/refined):
<ul>
<li>init(config)</li>
<li>showcase(container)</li>
<li>update(dt, gameState)</li>
<li>on(event, handler)</li>
<li>off(event, handler)</li>
<li>destroy()</li>
</ul>
</li>
<li>Emits events as <subsystem>:eventType (e.g. chess:move-executed, animation:finished)</li>
<li>Events are plain JS objects; event bus is decoupled from transport (local or network)</li>
</ul>

## Board/World Coordinate Conventions
- Y-up, right-handed (Three.js default)
- Board origin (0,0,0) is bottom-left square (A1)
- Squares indexed [file, rank] with 0-based indices, e.g. [0,0] = A1, [7,7] = H8
- All piece/board transforms relative to this frame
- Cell/piece geometry centered for easy transformation

## Determinism
- All chess logic, FEN/PROMOTION/randomness/etc, deterministic and snapshotable
- Visual/animation/AI permitted nondeterminism for polish if partitioned from logic

## Performance Budget
- Must sustain 60+ FPS @ 1080p on mainstream mid-2020s laptop (integrated graphics)
- Guidelines: ≤80 draw calls, ≤200K tris/frame, ≤128MB VRAM, ≤15ms per-frame JS (including event loop + rendering + logic)
- All modules profiled individually in showcase mode; logs archived in docs/STATUS.json

## Asset Policy
- Only final, AAA Staunton models (no cubes, no placeholder geometry)
- All assets (GLB, textures, HDRI) version-locked in repo, no fetch from CDN at runtime
- Source for all 3D/2D/PBR assets must meet premium bar, or be scheduled for upgrade before release
- Module failure (e.g. missing audio) must never prevent chess logic or render loop running
- All user interaction possible via both mouse & keyboard

## Module Failure Isolation
- Fatal exceptions in non-authoritative modules (e.g. audio, fx, UI) do not interrupt app/game logic or dev server
- Liveness monitor in test/auto harness detects and logs module failures in STATUS.json

## Verification/Testing Harness
- test/ contains Chrome headless harness:
    - Loads app, waits for 'ready' event
    - Loads predefined FENs, executes scripted move sequences
    - Sets camera to known presets
    - Captures full-res PNG screenshots and JSON logs (console/errors/fps/draws/gamestate)
    - Runs each module in 'showcase' scene to verify visuals and API contract
- All module builders required to run and pass the test harness before code is marked complete
- STATUS.json persists failures, critic scores, and tracks weakest modules for iteration

## Example Folder Structure

```
/chess/
/board/
/pieces/
/rendering/
/camera/
/interaction/
/animation/
/effects/
/ai/
/ui/
/audio/
/test/
/docs/
    STATUS.json
/vite.config.js
/index.html
/main.js
```