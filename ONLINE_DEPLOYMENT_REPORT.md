# Verified online deployment — 2026-10-30

## Public addresses

- Game: https://chua-an-lac-3d.vercel.app/
- Multiplayer HTTPS: https://chua-an-lac-multiplayer.onrender.com
- Multiplayer WSS: wss://chua-an-lac-multiplayer.onrender.com
- Health: https://chua-an-lac-multiplayer.onrender.com/health
- Source: https://github.com/khiemtranduc1704-code/vietnamese-temple-3d/tree/main

## Resources and configuration

Render service `srv-dbi6jhqfngtc73cer810`: Free, Singapore, one instance, main branch, auto-deploy off. Live deployment `dep-dbibnsnf3r2c73cjku80` built the game/server commit `fd52b85`, with the production origin updated to `https://chua-an-lac-3d.vercel.app`. The later documentation and deployment-test commit does not change gameplay or server runtime logic.

Vercel project `chua-an-lac-3d` under `khiem13`: Hobby, Vite, Node 22.x. Deployment `dpl_Aos4tMenFsrJPJadN7mduaARHc24` is READY and aliased to the public game URL above. Production access is public; previews retain Vercel authentication. The production environment sets the Render WSS endpoint. No paid upgrade, database, domain purchase or paid build machine was requested.

Both deployment builds succeeded on the hosting platforms. The Vercel build installed dependencies with zero reported audit findings. Existing local regression tests and the 20-client local multiplayer/production-origin suites passed before deployment.

## Checks against the real public deployment

`server/test/deployed.mjs` completed with exit code 0 against the URLs above:

- Public frontend HTTPS returned HTTP 200 without login/cookies, with the expected game title.
- The actual frontend JavaScript bundle contains the correct Render WSS URL.
- Backend `/health` returned `ok: true`, protocol 1, maxPlayers 20.
- Cross-origin browser OPTIONS preflight allowed exactly the production origin and Content-Type header.
- 20 real SDK WebSocket clients joined the same private room and received all 20 player states; a 21st join was rejected.
- Invalid room codes and incompatible protocol versions were rejected.
- Separate rooms did not share players, chat or incense state.
- Plain-text chat was sanitized and delivered to another player.
- Valid player movement was visible to another client; invalid/non-finite movement was rejected.
- Two players could not claim the same seat. Standing released the seat. Walking while meditating was rejected.
- Disconnect/reconnect preserved the player session and occupied seat.
- Bow action and its return to standing were synchronized; incense state was shared inside the room.
- An HTTP request from an unapproved origin was rejected.

Test clients left their QA rooms after verification. No friend invitation was sent automatically.

## Limits of verification

These were real HTTPS/WSS tests from the Mac against Render/Vercel, not local-server simulations. They verify deployed state synchronization, not 20 graphical browser sessions or performance on 20 separate devices. Browser-control tools were unavailable during the final hosting phase, so the deployed WebGL camera, animations, sounds and invitation buttons still need a human visual check. Two graphical browser tabs were verified earlier against the same game code locally.

Render Free may sleep when idle; cold start can take about a minute. Rooms and shared state live only in memory and disappear when the backend restarts/redeploys/sleeps. The prototype remains desktop-first, with no complete mobile controls or voice chat. Personal beads, book pages and virtual donation totals remain browser-local; virtual donations do not process real payments.

Read `DEPLOYMENT.md` for player instructions, updates and troubleshooting. Production frontend deployments currently use CLI, and backend deployments are manual, so a GitHub push alone does not publish an update.
