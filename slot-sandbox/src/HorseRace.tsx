



import { useEffect, useRef, useState } from 'react';
import * as PIXI from 'pixi.js';
import '@pixi/gif';   // <- this auto-registers the .gif parser with Assets

// --- asset imports --------------------------------------------------------
import trackImg    from './assets/racetrack.webp';
import h1Img       from './assets/horse_white.gif';   // ✔ exact path/extension
import h2Img       from './assets/horse_black.gif';
import h3Img       from './assets/horse_brown.gif';
import h4Img       from './assets/horse_gray.gif';
import panelImg    from './assets/ui_panel.webp'; // optional

const HORSE_IDS = ['White', 'Black', 'Brown', 'Gray'] as const;
type HorseId = typeof HORSE_IDS[number];

export const HorseRace: React.FC = () => {
  const viewRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<HorseId | null>(null); // bottom menu state

  useEffect(() => {
    if (!viewRef.current) return;
    const holder = viewRef.current;   // ← ADD THIS
    if (!holder) return;              // guard against the initial null

    const app = new PIXI.Application();
    let mounted = true;

    (async () => {
      await app.init({
        resizeTo: holder,
        backgroundAlpha: 0,           // let the CSS bg show
        antialias: true,
      });
      if (!mounted) return;
      viewRef.current!.appendChild(app.canvas);
// --- load textures in one go -----------------------------------------
// --- load textures one-by-one ----------------------------------------
const urls = [
  trackImg,
  h1Img,
  h2Img,
  h3Img,
  h4Img,
  // panelImg,          // add if/when you actually have the file
];

const textures: PIXI.Texture[] = [];

for (const url of urls) {
  try {
    const tex = await PIXI.Assets.load(url);   // <- works in Pixi v8
    if (tex) textures.push(tex as PIXI.Texture);
    else console.warn('[HorseRace] unsupported or empty asset:', url);
  } catch (err) {
    console.warn('[HorseRace] failed to load:', url, err);
  }
}

if (textures.length < 5) {
  throw new Error(
    `Need 5 textures (track + 4 horses); got ${textures.length}. Check paths, file types, or add @pixi/gif for GIFs.`
  );
}

// --------------------- create scene ----------------------------------
const [trackTex, h1Tex, h2Tex, h3Tex, h4Tex] = textures;

// racetrack background
const track = new PIXI.Sprite(trackTex);
track.anchor.set(0.5);
track.position.set(app.renderer.width / 2, app.renderer.height / 2);
app.stage.addChild(track);

// horse sprites
const horseTextures = [h1Tex, h2Tex, h3Tex, h4Tex];
const horses: PIXI.Sprite[] = [];

horseTextures.forEach((tex, i) => {
  const s = new PIXI.Sprite(tex);
  s.anchor.set(0.5);
  s.scale.set(0.6);
  s.position.set(track.x, track.y - 160 - i * 40);
  app.stage.addChild(s);
  horses.push(s);
});


      // --- cleanup on unmount -------------------------------------------
      return () => {
        mounted = false;
        if (app.renderer) app.destroy({ removeView: true });
      };
    })();
  }, []);

  // ---------- simple bottom UI (plain HTML) ------------------------------
  return (
    <div
      style={{
        width: '100%',
        height: 600,
        background: '#000',          // fallback if track doesn’t fill
        position: 'relative',
      }}
      ref={viewRef}
    >
      {/* horse-select panel */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          background: '#111c',
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          padding: '0.75rem 0',
        }}
      >
        {HORSE_IDS.map(id => (
          <button
            key={id}
            onClick={() => setSelected(id)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 8,
              border: selected === id ? '2px solid #ffd700' : '1px solid #888',
              background: '#2d9cdb',
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {id}
          </button>
        ))}

        {/* play button disabled until a horse is picked (Step 2 will wire) */}
        <button
          disabled={!selected}
          style={{
            marginLeft: '2rem',
            padding: '0.5rem 2rem',
            borderRadius: 8,
            border: 'none',
            background: !selected ? '#555' : '#28a745',
            color: '#fff',
            cursor: !selected ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          Play
        </button>
      </div>
    </div>
  );
};
