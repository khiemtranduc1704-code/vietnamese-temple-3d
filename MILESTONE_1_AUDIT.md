# Milestone 1 stability audit

Date: 2026-10-30 (Vietnam local date).
Project: `/Users/khiem/Downloads/ChatGPT/Vietnamese-Temple-3D`.
Runtime: project-local Node.js 22.21.1; Three.js 0.180.0; TypeScript 5.9.3; Vite 7.3.7.

## Preservation and Git

The repository initially had no commits. All existing source, documentation, lockfile, launcher and preview image were preserved in local baseline commit `3ddb466` before any audit edits. No reset, checkout, force operation, dependency upgrade or push was used. The final audited commit is identified by the local `milestone-1-stable` tag. Git author metadata uses `Codex <codex@local.invalid>` for these automated local checkpoints because no user identity was configured; global configuration was not changed.

The environment, statues, hall architecture, avatar, 18 empty meditation mats, worship actions, book, beads, wooden fish, simulated donations, fortune slips, incense and star-offering table are retained. Only the two scripture desks and their reading cushions were shifted slightly between mat rows to resolve their overlap with sitting clearance. No networking code, multiplayer rooms, backend services or public hosting were added.

## Reproduced errors and fixes

1. **Camera could cross scenery while smoothing.** A clear desired orbit ray did not guarantee a clear interpolated position. A regression constructs a wall and two unobstructed endpoints whose interpolation lands inside the wall. Camera obstruction is now resolved both before and after smoothing, with padding. Camera rays use current world matrices.
2. **Invisible objects could obstruct the camera.** Three.js raycasting can hit hidden meshes and children of hidden groups. The camera now excludes invisible hierarchies, the avatar hierarchy and smoke sprites. Sprite raycasting has a camera assigned so it cannot throw.
3. **Returning to the hall swept the camera through the courtyard.** Hall entry/H and the courtyard reset now place the camera immediately at a safe orbit, clear held input and dragging, and establish a predictable facing. Normal orbit movement still interpolates.
4. **Scripture desks blocked nearby meditation mats.** The original desk at `(5.8, -11.9)` failed the sitting-clearance check for the mat at `(7, -12.25)`, with the mirrored case on the left. Desk bases now use `(+-5.65, -10.1)`; tabletops remain 0.9 units forward of their bases. Shared layout constants and regression tests keep all 18 mats clear of the desks. Seating validates its destination before moving the avatar.
5. **Prayer dialog bypassed object clearance.** Opening rituals near a wall could force the avatar into a prayer pose without checking room for its hands. Opening now checks clearance. Rejected action requests retain the existing action instead of closing it first.
6. **Shift+R did not close the practice panel.** Its capture handler swallowed uppercase R. It now matches R case-insensitively. Pointer cancellation/lost capture also ends camera dragging, and late pointer releases cannot strike the wooden fish after closing practice.
7. **Launch documentation referred to the old Documents path.** Updated the beginner command for the actual Downloads location. The portable launcher already resolves its own folder and remains executable.

## Automated verification

All five `npm test` suites pass:

- Worship holds, walking locks, standing recovery, smooth interruptions, three complete prostrations, finite pose samples.
- Bead cycles/pacing, saved count restoration and book page boundaries.
- Supported VNĐ denominations, donation totals, incense counts/locations, fortune bounds and saved ritual restoration.
- Old desk regression, all 18 mat clearances, reading cushions, wall collision, sliding, world boundaries and forward worship clearance.
- Camera interpolation regression, invisible meshes/parents, ignored avatar, sprites and zero-length offsets.

`npm run build` passes TypeScript checking and the Vite production bundle. There are no compilation errors. Vite still reports a non-fatal bundle-size advisory (approximately 561 kB minified JavaScript, 150 kB gzip); code splitting/performance profiling can be a separate task.

The first build attempt in the restricted shell could not replace the existing `dist` files after the folder move. Re-running with authorized Downloads write access succeeded; this was a filesystem permission issue, not a TypeScript failure. `dist`, `.runtime` and `node_modules` remain ignored by Git.

## Production-browser verification

Tested the actual `dist` output using a temporary Vite preview on `http://127.0.0.1:4173/`, separate from the user's development server at port 5173. This also kept smoke-test localStorage separate from the user's existing progress.

Verified:

- Hall entry places the camera immediately; camera orbit near the side wall and held movement at the wall remain inside the accessible area.
- Walked to the formerly obstructed right-hand middle-row mat and pressed E: meditation succeeds. Holding W while seated does not move the player; R returns to standing.
- Repositioned reading desk still opens its book with E.
- Full prostration with W held keeps walking disabled; the settled kneeling and lowered poses were visually inspected from the side.
- Three prostrations complete and return to kneeling; standing bow returns to standing and walking resumes.
- Joining palms activates normally; unsafe prayer near the side wall is refused.
- Shift+R closes the practice panel and restores standing.
- Beads, scripture book, wooden-fish panel/strike and ritual panel still open and close.
- No JavaScript errors or warnings appeared in the production-browser console during this smoke test.

Production screenshot: `audit-production.jpg`.

## Remaining manual testing

- A longer free-play session through every path, gate opening, column, pond edge and offering table, including repeated close camera orbits and zoom at unusual angles.
- Visual hand/knee/head contact through every transition on both ground and mats. The existing bounds-clearance solution is retained; this is not full-body inverse kinematics or a physics engine.
- Audio quality/volume, focus loss, trackpad behavior and keyboard layouts in desktop Chrome, Safari and Firefox on the user's devices.
- Frame-time/GPU-memory profiling on lower-powered machines and high-DPI displays. No numeric FPS performance claim is made.
- Multiplayer networking and 10-20-player capacity are explicitly outside this audit and have not been implemented or load-tested.

## Re-run locally

From the project folder, with Node.js 22 available:

```sh
npm test
npm run build
npm run preview
```

On this Mac, prepend `PATH="$PWD/.runtime/bin:$PATH"` when using the bundled project-local runtime. Continue normal play with `Start Temple.command` or `npm run dev` at the printed localhost URL.
