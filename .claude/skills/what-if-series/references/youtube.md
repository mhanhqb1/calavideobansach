# The YouTube package

All copy is in the video's language, written for its audience. Save it in `series/<slug>/youtube.md` with these headings
(`check` reads them).

Why this matters: on this channel about two thirds of views come from the Suggested column, next to the big What If
channels, and only about 1 % of people shown a thumbnail there clicked it (Oct-Nov 2026). People who did click watched
well. So the title and the thumbnail are where views are won or lost, and every film ships three thumbnails and three
titles to test against each other.

```markdown
## Title
<the strongest title from the tests below, under 70 characters>

## Title tests
- A: <title paired with thumbnail A>
- B: <title paired with thumbnail B>
- C: <title paired with thumbnail C>

## Description
<two or three sentences of hook: the rule and what goes wrong. Don't reveal the ending.>

<the question from the last part, inviting comments.>

CHAPTERS
<output of the chapters command>

WHAT'S REAL
<each fact, its source, and plainly what's an estimate or contested>

#Tag1 #Tag2 #Tag3

## Tags
tag one, tag two, tag three

## Pinned comment
<the choice at the heart of the film, as a question, without spoiling the ending>
```

Limits `check` enforces: title 100 characters (it warns over 70, where results cut it off), description 5000, tags 500
(a tag with a space counts two more), at least three chapters, starting at 0:00, each at least 10 s, three thumbnail
variants and three title tests.

Translate the headings inside the description ("CAPÍTULOS", "¿QUÉ HAY DE REAL?"). Chapter titles tease and don't spoil.
Tags: the premise's exact wording with and without accents, the format, and two or three real search phrases. The plain
"What if ...?" search wording belongs in the tags and the first line of the description, so the title is free to hook.

Settings to pass on: the video's language, Film & Animation, and not made for kids. Tell the person to check YouTube's
current rule on disclosing AI content. Never say or imply that other channels make their videos with a given tool.

## The title

A bare premise ("¿Qué pasaría si fueras el último hombre en la Tierra?") looks exactly like the competing video beside it.
A title wins the click when it adds something the premise alone doesn't promise: a twist, a cost, a number, a mystery.

Write at least eight candidates, then keep the best three, each from a different angle:

| Angle | What it adds | Example |
|---|---|---|
| Premise + twist | The premise, then the turn the viewer didn't see coming | Eres el Último Hombre en la Tierra. Y Alguien Te Contesta por Radio |
| The dark side of the gift | A dream that turns into a trap | Todas las Mujeres se Enamoran de Ti. Y Es una Pesadilla |
| A hard number | A specific figure that makes the scale real | Un Millón de Robots Te Dan la Razón. Ese Es el Problema |
| The rule | One strange rule, stated flat, that begs the question "and then?" | Toda Mujer Te Dice Que No. Aunque Quiera Decir Que Sí |
| You decide | A dilemma aimed at the viewer | 5.000 km en Moto Por Oír Tu Nombre. ¿Irías? |

Rules for every title:

- **Second person**, present tense: "Eres", "Te despiertas", not "Un hombre que...".
- **Under 60 characters is ideal, 70 at most.** Suggested and mobile cut the rest. The hook must be in the first 40.
- **Concrete over vague:** "5.000 km", "412 llamadas", "a diez metros" beat "muy lejos", "muchas", "cerca".
- **Promise only what the film delivers.** The twist must happen, and early enough that the viewer stays to see it.
- **No spoiler of the ending.** Reveal the turn of act one or two, never the resolution.
- **Title Case in the video's convention, no ALL CAPS title, at most one word in caps** ("NADIE").
- **Title and thumbnail split the job.** The thumbnail's words never repeat the title; together they tell more.
- Search YouTube for each finalist; drop any a channel already uses.

Score the finalists 1-3 on: would I click this next to a big What If video? Is the hook in the first 40 characters? Does
it promise a conflict, not just a situation? Put the highest total in `## Title`, as pair A.

## The three thumbnails

Three components, `src/thumbnails/<Name>A.tsx`, `<Name>B.tsx`, `<Name>C.tsx`, each a 1920 x 1080 frame, each built on a
different idea so the test teaches something. Don't make three colour versions of one picture.

| Variant | The idea | Example for "the last man on Earth" |
|---|---|---|
| **A, the premise at a glance** | The situation readable in half a second, the hero small against it | A wide empty avenue, stopped cars, one tiny figure; "NO QUEDA NADIE" |
| **B, the emotion** | A big face with a strong, specific emotion and one clue to why | Tear-streaked face lit by a radio; "¿HAY ALGUIEN?" |
| **C, the twist or the threat** | The film's mystery or danger, the hero reacting to it | The hero on a motorbike, a pack of dogs behind; "5.000 KM" |

Pair each with a title from the same angle, A with A and so on.

What every variant needs:

- **One focal point, the brightest thing in frame.** A face, when there is one, is about a third of the frame height,
  off to one side.
- **A different expression every film, and between variants.** The open-mouth "o" face was on every thumbnail so far;
  use it at most once in the three. Fear, a smug grin, tears, rage, a scream, shock with hands to the head.
- **At most three words,** in the title face, heavy stroke, slightly tilted, in the empty third. One block of text, not
  several. They add to the title instead of repeating it.
- **High contrast:** a saturated sky or a single strong colour against dark, the story's most striking colour moment.
  Red, yellow and cyan on near-black read best in a feed.
- **Bottom right stays free of anything vital:** YouTube's duration badge sits there.
- **Reads at 320 x 180.** If the premise isn't clear at that size, cut elements until it is.

`src/ThumbEnamoradas.tsx` is a working example:

```tsx
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hero, KitDefs, SetDefs, Rooftop, FONT } from '../engine';

export const MyThumbA: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#14101C' }}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080">
      <KitDefs />
      <SetDefs />
      {/* the set, then the crowd behind, the hero, the crowd in front, the words last */}
    </svg>
  </AbsoluteFill>
);
```

Render each with its letter:

```bash
python <skill>/scripts/series.py thumb <slug> MyThumbA --variant a
python <skill>/scripts/series.py thumb <slug> MyThumbB --variant b
python <skill>/scripts/series.py thumb <slug> MyThumbC --variant c
```

Each writes `thumbnail-<x>.png`, `.jpg` (1280 x 720, under YouTube's 2 MB) and `-small.png` (320 x 180). Variant A is
also saved as `thumbnail.jpg`, the default upload. Once all three exist, `thumbnails-compare.png` puts the three small
ones side by side: open it and ask which you'd click in a feed. If one is clearly weaker, rework it before handing over.

Tell the person to upload all three in YouTube Studio's **Test & Compare** (on the video's Details page) and to try the
other two titles too if Studio offers title testing. Judge after two or three weeks or once YouTube names a winner, and
note the winning angle in `references/lessons.md` so the next film starts from it.
