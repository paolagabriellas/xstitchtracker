import { ColorInfo, Stitch, Pattern, FlossCrossImage } from "./types";
/**
 * Parsing a FlossCross JSON export into a normalised pattern object.
 *
 * FlossCross structure (observed):
 *   model.images[0].width / height
 *   model.images[0].flossIndexes[]  — color definitions
 *   model.images[0].crossIndexes[]  — maps cross array value → floss index (fi)
 *   model.images[0].layers[0].cross — flat row-major array, length = width * height
 */

export function parseFlossCross(json: any): Pattern {
  const img = json?.model?.images?.[0] as FlossCrossImage | undefined;
  if (!img) throw new Error("No image data found in this FlossCross file.");

  const { width, height, flossIndexes, crossIndexes, layers } = img;
  const layer = layers?.[0];
  if (!layer?.cross) throw new Error("No cross stitch layer found.");

  const cross = layer.cross;
  const title = json.dv || json.modelId?.slice(0, 8) || "My Pattern";

  const colors: Record<number, ColorInfo> = {};
  flossIndexes.forEach((f: any, i: number) => {
    colors[i] = {
      idx: i,
      name: f.name,
      dmc: f.id,
      hex: "#" + (f.hex >>> 0).toString(16).padStart(6, "0"),
    };
  });

  const ciToFi: Record<number, number> = {};
  crossIndexes?.forEach((ci, idx) => {
    ciToFi[idx] = ci.fi;
  });

  const stitches: Stitch[] = [];
  for (let i = 0; i < cross.length; i++) {
    const val = cross[i];
    if (val === null || val === undefined) continue;
    const fi = ciToFi[val] ?? val;
    if (!colors[fi]) continue;
    const row = Math.floor(i / width);
    const col = i % width;
    stitches.push({ row, col, colorIdx: fi });
  }

  return { title, width, height, colors, stitches };
}

/** DMC sort key: numeric codes sort numerically, specials (B5200, etc) sort after */
export function dmcSortKey(dmc: string) {
  const n = parseInt(dmc, 10);
  return isNaN(n) ? dmc : String(n).padStart(6, "0");
}
