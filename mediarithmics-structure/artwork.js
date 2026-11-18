/* Each printed contour is a section through the same object.
   Keeping the point order lets the three illustrations share a continuous transition. */
(function (root) {
  'use strict';
  const colours = ['#00a1df', '#ff5959', '#00ad68', '#f58d39'];
  const ink = '#061e44';
  const bands = 4;
  const slicesPerBand = 13;
  const pointsPerLoop = 10;
  const pi = Math.PI;

  function loop(cx, cy, rx, ry, angle, twist, scale) {
    const points = [];
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    for (let j = 0; j < pointsPerLoop; j++) {
      const a = 2 * pi * j / pointsPerLoop;
      const radial = 1 + .19 * Math.cos(3 * a + twist) + .08 * Math.sin(2 * a - twist);
      const x = rx * radial * scale * Math.cos(a);
      const y = ry * radial * scale * Math.sin(a);
      points.push([cx + x * cos - y * sin, cy + x * sin + y * cos]);
    }
    const fmt = n => n.toFixed(1);
    const xy = p => fmt(p[0]) + ',' + fmt(p[1]);
    let path = 'M' + xy(points[0]);
    for (let j = 0; j < points.length; j++) {
      const p = points[(j + points.length - 1) % points.length];
      const q = points[j];
      const r = points[(j + 1) % points.length];
      const s = points[(j + 2) % points.length];
      path += 'C' + xy([q[0] + (r[0] - p[0]) / 6, q[1] + (r[1] - p[1]) / 6]) +
        ' ' + xy([r[0] - (s[0] - q[0]) / 6, r[1] - (s[1] - q[1]) / 6]) + ' ' + xy(r);
    }
    return path + 'Z';
  }

  function geometry(stage, band, slice) {
    const u = slice / (slicesPerBand - 1);
    const t = (band + u) / bands;
    if (stage === 1) {
      const clusters = [[420, 106], [474, 263], [244, 181], [161, 277]];
      const [x,y] = clusters[band];
      return [x - 32 * u, y + 16 * u, 75 + 7 * u, 53 + 6 * u, -.55 - .26 * band, t * 4.2, .53];
    }
    if (stage === 2) {
      const spread = Math.sin(pi * t);
      return [502 - 349 * t, 212 - 58 * spread + 55 * t, 46 + 81 * (1 - t),
        38 + 54 * (1 - t), -.93 + 1.35 * t, .4 + 3.5 * t, .59];
    }
    return [453 - 254 * t - 18 * Math.sin(pi * t), 123 + 129 * t - 31 * Math.sin(pi * t),
      101 + 21 * t + 10 * Math.sin(pi * t), 78 + 18 * t, -.79 + .38 * Math.sin(2 * pi * t),
      .5 + 4.6 * t, .55];
  }

  function makeStage(stage) {
    const layers = [];
    for (let band = 0; band < bands; band++) {
      const colour = colours[bands - band - 1];
      for (let i = 0; i < slicesPerBand; i++) {
        const [x,y,rx,ry,a,twist,hole] = geometry(stage, band, i);
        const outer = loop(x,y,rx,ry,a,twist,1);
        const inner = loop(x + rx * .045,y - ry * .028,rx,ry,a,twist,hole);
        const face = i === slicesPerBand - 1;
        layers.push({d:outer + inner, stroke:colour, fill:face ? colour : ink, width:face ? 1.15 : 1.6});
        if (face) {
          layers.push({d:loop(x,y,rx,ry,a,twist,.925), stroke:ink, fill:'none', width:1.15});
          layers.push({d:loop(x,y,rx,ry,a,twist,.67), stroke:ink, fill:'none', width:1.15});
        }
      }
    }
    return layers;
  }

  function svg(stage) {
    const paths = makeStage(stage).map(p =>
      '<path fill-rule="evenodd" stroke-linejoin="round" fill="' + p.fill + '" stroke="' + p.stroke +
      '" stroke-width="' + p.width + '" d="' + p.d + '"/>').join('\n');
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="25 15 570 370">' + paths + '</svg>';
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {svg};
  else root.MicsArtwork = {makeStage, svg};
})(typeof window === 'undefined' ? globalThis : window);
