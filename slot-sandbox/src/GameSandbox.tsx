import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

export const GameSandbox: React.FC = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const holder = container.current;
    if (!holder) return;                 // nothing to mount into

    const app = new PIXI.Application();
    let initDone = false;                // flag so we know if renderer exists

    (async () => {
      await app.init({
        backgroundColor: 0x0c0c0c,
        antialias: true,
        resizeTo: window,                // safest auto-resize target
      });

      initDone = true;

      // Put the <canvas> inside our div and make it fill the space
      app.canvas.style.width  = '100%';
      app.canvas.style.height = '100%';
      holder.appendChild(app.canvas);

      // Bring the renderer to the div’s exact size once after mount
      const fit = () =>
        app.renderer.resize(holder.clientWidth, holder.clientHeight);
      fit();
      window.addEventListener('resize', fit);

      // Simple helper for in-canvas buttons
      const makeButton = (label: string, x: number, y: number) => {
        const g = new PIXI.Graphics()
          .beginFill(0x2d9cdb)
          .drawRoundedRect(0, 0, 120, 40, 8)
          .endFill();

        g.position.set(x, y);
        g.eventMode = 'static';          // replaces interactive=true
        g.cursor    = 'pointer';         // replaces buttonMode

        const txt = new PIXI.Text(label, {
          fontFamily: 'Arial',
          fontSize: 16,
          fill: 0xffffff,
        });
        txt.anchor.set(0.5);
        txt.position.set(60, 20);
        g.addChild(txt);

        g.on('pointertap', () => console.log(`${label} clicked`));
        app.stage.addChild(g);
      };

      makeButton('Spin',     60, 60);
      makeButton('Autoplay', 60, 120);

      // remove listener if the component is unmounted AFTER init
      app.ticker.addOnce(() =>
        holder.isConnected || window.removeEventListener('resize', fit)
      );
    })();

    // --- cleanup ----------------------------------------------------------
    return () => {
      if (initDone) {
        app.destroy(
          { removeView: true },          // pull canvas out of the DOM
          { children: true, texture: true, textureSource: true, context: true }
        );                              // :contentReference[oaicite:1]{index=1}
      }
    };
  }, []);

  return <div ref={container} style={{ width: '100%', height: 400 }} />;
};
