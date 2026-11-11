import React from 'react';
import { Composition } from 'remotion';
import './engine/fonts';
import { STUDIO } from './studio.config';
import { EPISODES } from './episodes';
import { CastSheet } from './CastSheet';

// Every episode gets its compositions at its own size (vertical book episodes 1080 x 1920, classic ones 1920 x 1080):
//   <Id>       the film
//   <Id>Board  one frame per shot, at its key frame, for the storyboard
//   <Id>Cover  the cover frame for TikTok / Shopee (vertical episodes)
// Cast renders the cast sheet.
//   npx remotion studio src/index.ts --port 3430

export const Root: React.FC = () => (
  <>
    {EPISODES.map((e) => (
      <React.Fragment key={e.id}>
        <Composition id={e.id} component={e.Main} durationInFrames={Math.max(1, e.total)} fps={STUDIO.fps} width={e.width} height={e.height} />
        <Composition id={`${e.id}Board`} component={e.Board} durationInFrames={Math.max(1, e.shotCount)} fps={STUDIO.fps} width={e.width} height={e.height} />
        {e.Cover ? <Composition id={`${e.id}Cover`} component={e.Cover} durationInFrames={1} fps={STUDIO.fps} width={e.width} height={e.height} /> : null}
      </React.Fragment>
    ))}
    <Composition id="Cast" component={CastSheet} durationInFrames={1} fps={STUDIO.fps} width={STUDIO.width} height={STUDIO.height} />
  </>
);
