# Lessons from the first series

Each of these cost a render or a round of fixes on the 15-part "Enamoradas" series. `what-if-animation/references/traps.md`
has the general list; these are the ones a series adds.

## Cues

- **The first word of the script can't be a cue:** it lands before frame 0 and `plan.py` writes no timeline. Part 1's
  first cut is `f:0`, and a later cut on a repeated word needs a word that only appears later ("sientan", not "te").
- **A word cue finds the next occurrence after the previous cut.** "tu" in "tu casa cruje. Tu hermana" lands on the
  wrong one: cue "hermana", or check the shot list's Words column.
- **Cues are lower case, with accents:** `qué`, `él`, `ahí`.

## Code

- **`shake()` returns `{x, y}`, not a string.** Put in a transform string it becomes `[object Object]`, and the browser
  drops the whole transform, so the camera silently stops working. Write `translate(${s.x} ${s.y}) ${camT(...)}`.
- **SVG ids can't have spaces.** A `Schematic id` built from a label like "VACIAR SUS CUENTAS" lost its filters and the
  ground went black. Strip non-word characters from any id made from text.
- **A long close-up has no action.** Close-ups read fine at 1 s, dull at 3: hold them short or give them a slow push.
- **`shots.tsx` exports shots only.** The part's `index.tsx` passes the whole module as the shot map. Helpers shared
  between parts go in `<slug>-common.tsx`.

- **`armL` and `armR` both open outward with a positive `a`.** A negative `armL.a` folds the arm behind the body, and
  the character looks one-armed.
- **A `driver` or anything seated inside a prop is clipped to its window,** or the whole body hangs out under it.

## Rendering

- **Remotion writes frames to the system temp folder.** With little free space there (1.2 GB on the second series),
  every full render failed while storyboards and short test renders passed. Point `TEMP` and `TMP` at a roomy drive
  for the `render` command.
- **A looping background moves by its own tile width.** `slide % 900` on a 1900-wide street jumped every half second,
  which only `motiongrid.py` showed.

## Drawing

- **Check feet against the set's ground, and against `low`.** `Street low={200}` moves the pavement down 200; figures at
  the old height stand in the sky. Compute hips from the ground: `hipY(ground, scale)`.
- **Scale between characters:** a child is about 0.72 of an adult standing at the same depth. A nearer child drawn at
  1.3 looked like a giant beside the adult on the bed.
- **A figure behind a window is clipped to it,** or legs show through the wall.
- **What sits behind glass is drawn before the glass.** Draw the pane last; when it breaks, swap it for a ring with a
  jagged hole, and draw what comes through it after that ring.
- **Wind-ups can hide the face.** The head is huge on this rig, so a prop at the shoulder covers it. Swing from low.
- **Foreground heads need something on them:** a plain dark disc reads as a black ball. Add an ear or a collar.
- **Pictures on a TV need a clip path,** or the full figure's legs hang out under the screen.
- **Hearts and sparks land off the number,** not on it, when a shot's point is a figure.
- **Labels stay inside the crop of the shot's zoom.** At zoom 1.3, y 140 is off frame.
- **Crowds start fully below frame** when they're the reveal. A crowd rising from `y + 420` was already visible on
  frame 0 and gave the turn away.
- **Pose props in hands from the pose:** `toWorld(pose, joints(pose).armL.end)`, so they follow in every frame.

## Timing a story beat

- When the script names people one at a time ("Mo. Tu madre. Ella."), key each fade to its word; a shot that fades them
  during the line before it spoils the beat.
- A wish means shut eyes. `Close` takes `blink`.

## Sound and cost

- **Voice costs about 0.4 credits a character** on this account, not the 0.22 the older docs quote. A series averaged
  about 225 credits a part all in, falling as the shared library grows. Music beds (about 230 to 300 each) are the big
  item, so keep to one per mood.
- **`sfx.py` waits on the account counter each run and often logs 0 for short clips.** The per-part reports then
  undercount: take the total from the account (`status`).
- **A shared room tone is what crowds the voice** when it runs under speech. Keep room tones around 0.06 to 0.1 and a
  drone on a key line under 0.3. Defaults that worked: `sfx_lu` -5, `music_lu` -11; -8 where the stem is sparse.
- **A key missing permissions fails after spending.** `voice.py` records the take, then crashes reading history, and it
  isn't lost: the next run reuses it. `preflight` catches this first.
