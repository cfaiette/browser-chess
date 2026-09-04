# Pull request draft — factory/SF-0006/integration → main

Target: https://github.com/cfaiette/browser-chess

## Summary
- Premium Three.js + Vite 3D chess playable milestone on `factory/SF-0006/integration`
- Legal chess engine (castling, EP, promotion, mate/stalemate) with tests
- Khronos “A Beautiful Game” Staunton GLB pieces (CC BY 4.0) + procedural fallback
- Depth-3 AI with opening book, quiescence, mobility eval
- Procedural positional SFX + ambient/reverb bus
- Playwright Chrome screenshot gauntlet (`npm run verify:chrome`)
- Honest `docs/STATUS.json` critic overall **8.5**

## Test plan
- [ ] `npm install && npm test`
- [ ] `npm run build`
- [ ] `npm run verify:chrome` (writes `docs/verify-chrome.json` + PNGs)
- [ ] `npm run dev` — click moves, AI reply, F flip camera, promotion, restart
- [ ] Confirm LICENSE attribution for Staunton asset

## Publish commands (requires auth)

```bash
cd repositories/browser-chess/source
git push -u origin factory/SF-0006/integration
gh pr create --base main --head factory/SF-0006/integration \
  --title "Factory SF-0006: premium Three.js chess milestone (critic 8.5)" \
  --body-file docs/PR_DRAFT.md
```

## Auth blockers (current machine)
- `gh auth status` → not logged in
- SSH to github.com → Permission denied (publickey)
- Unblock: `gh auth login` **or** add `~/.ssh/id_rsa.pub` to GitHub SSH keys
