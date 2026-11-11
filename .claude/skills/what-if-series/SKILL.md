---
name: what-if-series
description: Turn one line like "video về xxx khoảng 5-10 phút" or "make a 7 minute What If video about xxx" into a finished long animated video: script, split into 15-25 s parts built with what-if-animation, joined into one film, plus a YouTube package: three thumbnails and three titles to A/B test, description, chapters and tags. Use this whenever someone asks for a What If style or stick-figure animated video longer than about a minute, gives a length in minutes, asks for a multi-part or series episode, or wants the video and its YouTube package from a single request, even if they don't say "series". For a single 15-25 s clip use what-if-animation instead.
---

# What If series

One request in; one finished film and its YouTube package out. Every part is an ordinary `what-if-animation` episode,
so its rules, look and kit all apply. This skill adds the long story, the batch tooling and the publishing package.

Read `../what-if-animation/SKILL.md` first, then `references/story.md` (step 2), `references/lessons.md` (before
drawing, it lists what already cost time), `references/youtube.md` (step 8).

## How to behave

The person wants to give one line and get a video. Work through to the end without stopping for approval: pick sensible
defaults, state them in one line, and report them at the end. Stop only for a real blocker: a missing key or
permission, a plan that can't use the voice, not enough credits, or a request step 1 rules out. Don't upload or publish
anything; hand over the files.

Long runs are the norm: about 5.5 minutes of rendering per part, so run `render` and `sound` in the background and carry
on when they finish. Tell the person what's happening at each stage in their language.

## The tool

Everything runs from the studio folder (`what-if-studio`; if it's missing, do the Setup in `what-if-animation`):

```bash
python <skill>/scripts/series.py <command> <slug> [options]
```

| Command | What it does | Spends credits |
|---|---|---|
| `preflight <slug>` | Tools, key permissions, balance, the voice's languages, the cost estimate | no |
| `voice-search --lang es [--gender male]` | Library voices for a language | no |
| `init <slug>` | One `episode.json` per part from `guion.md` | no |
| `count <slug>` | Words, seconds and characters per part | no |
| `voices <slug>` | Records every part (cached) | yes |
| `apply <slug>` | Merges `plans/NN.json` and `clips.json` into each part | no |
| `plan <slug>` | Timelines, each part's `index.tsx`, registers parts that have `shots.tsx` | no |
| `boards <slug> [--parts 2,3]` | Stills and a storyboard per part | no |
| `sound <slug>` | Generates and mixes (cached; slow: run in the background) | yes |
| `mix <slug>` | Clear-voice check, showing only clashes of 3 dB or more | no |
| `render <slug> [--parts 13] [--force]` | Masters what's missing, then joins the film (slow: background) | no |
| `join <slug>` | Joins the finished parts | no |
| `thumb <slug> <Component> --variant a\|b\|c` | Registers and renders one of the three thumbnails; with all three, a side-by-side sheet | no |
| `chapters <slug>` | YouTube chapter lines from real durations | no |
| `check <slug>` | Checks `youtube.md` against YouTube's limits | no |
| `status <slug>` | What's done per part, and the credits | no |

## The files you write

```
series/<slug>/series.json    {"slug", "id_prefix", "title": [line1, line2], "topic", "voice": {"id": ...}, "script_tag": "VOICE"}
series/<slug>/guion.md       the script: "### Part 01: name", a line "VOICE: <spoken text>", a line "NOTE: <gloss>"
series/<slug>/clips.json     {"clip_name": ["prompt", seconds]}, shared by all parts
series/<slug>/plans/NN.json  one part's shots, edit, fx, events, music, levels
series/<slug>/chapters.json  [[part, "chapter title"], ...]
series/<slug>/youtube.md     title, three title tests, description, tags
src/episodes/<slug>-common.tsx    the series' cast, power look (`export const looks = {...}`), sets and props
src/episodes/<slug>-NN/shots.tsx  one exported component per shot, and nothing else exported
src/thumbnails/<Name>A.tsx, B, C  the three thumbnails, one idea each
```

A plan file, with cues as in `what-if-animation` (see "Cues" in `references/lessons.md`):

```json
{"shots": [["S1", "wide", "office", 20, "what we see"]],
 "edit": [["S1", "f:0"], ["S2", "mira"], ["S3", {"at": "flechazo", "look": "flechazo"}]],
 "fx": [{"at": "S3+1", "kind": "flash", "color": "#FF7FB0"}],
 "events": [["S1", "room_tone", 0.08, "onset", "S4"], ["S3+2", "power", 0.3]],
 "music": "music", "levels": {"sfx_lu": -5, "music_lu": -11}}
```

## The pipeline

### 1. Read the request

- **Length:** parts = minutes x 60 / 21, rounded. For a range, aim at the middle ("5-10 phút" is 7.5 minutes, 21 parts).
  Above about 15 minutes, say what it will cost in time and credits, then make the shortest version that honours the
  request unless they insist.
- **Language and audience:** what they name; otherwise the language of the title they gave; otherwise the language they
  wrote in. Use that country's words ("móvil" in Spain, "celular" in Mexico).
- **Topic:** if it's not a What If premise, frame it as one. Check `what-if-animation`'s rules on original stories and
  real people. If the topic has romance or attraction in it, every character involved is clearly an adult, shown by job
  and clothes, love stays non-sexual, and children are outside the power. Decline a premise that can't be kept that way
  rather than softening it silently.
- **Slug:** short and ASCII, like `enamoradas`.

### 2. Script

Read `references/story.md`. Search YouTube for the premise first and change it if a channel has that exact episode.
Write `guion.md`: one block per part, 45 to 65 words, and put a gloss in the person's language in `NOTE:` if they don't
read the video's language. Source every fact in `references/story.md`'s way. Run `count`, and fix anything out of range.

### 3. Voice

Choose a voice verified for the language: `voice-search`, then set it in `series.json`. Run `preflight`; it needs a key
with text to speech, sound generation, user read and speech history read, and most library voices need a paid plan.
Then `init`, `voices`. Check each part lands between 15 and 25 s (`status`).

### 4. The cast and sets

Write `<slug>-common.tsx`: the power's look, and any looks and sets the story needs. Reuse what exists: the sets in
`src/engine/sets/` and `episodes/enamoradas-common.tsx` (bus, news studio, bunker, van, hospital, night roof, meteor,
phone close-up, gifts, TV camera, close-up and staging helpers) can be imported as they are. Add a look with
`{ ...LOOKS.jefa, jacket: '#...' }` when it's only a colour change.

### 5. Shots, in batches of four to six parts

Write `shots.tsx` and `plans/NN.json` for a batch, then `apply`, `plan`, `npx tsc --noEmit`, `boards`. Aim for 9 to 12
shots a part: the opening part at 27+ cuts a minute, later parts about 22 or more. Open each storyboard and run the
checklist in `what-if-animation/references/look.md`. Fix what fails before writing the next batch, since the same
mistake otherwise repeats in every part.

### 6. Sound

Write `clips.json`, reusing library clips by exact name, prompt and length. One music bed per mood (light, tense,
thriller, soft) keeps the cost down and the story arcing. Run `sound` in the background, then `mix`. Words that matter
must stay clear: lower that event, or `sfx_lu` to about -8.

### 7. Render and check

`render` in the background. Then look at it: a contact sheet of the film, and `motiongrid.py` for action shots, read
like a flipbook. A motion bug can't be seen on a storyboard; every big one in the first series showed up only here. To
fix a shot: edit it, `render --parts N --force` (this rejoins the film).

### 8. YouTube package

Read `references/youtube.md`. Write at least eight title candidates and keep three, each from a different angle. Build
three thumbnails, each on a different idea (premise, emotion, twist), and render them with `thumb --variant a|b|c`.
Open `thumbnails-compare.png` and rework any that's clearly weaker. Then `chapters.json`, `chapters`, `youtube.md`
(with `## Title tests`), `check`. Don't skip the three thumbnails or the three titles, even when time is short.

### 9. Hand over

The film and thumbnails are in `out/series-<slug>/`, each part in `out/<slug>-NN/`. Give the film, the parts, the three
thumbnails with the comparison sheet, the three titles paired with them (and which pair you'd use first and why), and
the description and tags ready to paste. Remind them to upload all three thumbnails in Studio's Test & Compare. Report: the length,
credits from `status`, the defaults you chose, what you couldn't check, and what you'd still improve. Be plain about
this: you can't hear audio, so the sound has only been measured, and someone should watch it once with sound. Pass on
what they must verify before posting: the title search, weak sources, YouTube's AI disclosure.
