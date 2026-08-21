export interface FlossCrossImage {
  width: number;
  height: number;
  flossIndexes: {
    name: string;
    id: string;
    hex: number;
    rgb?: number;
  }[];
  crossIndexes: { fi: number }[];
  layers: { cross: (number | null)[] }[];
}

export interface ColorInfo {
  idx: number;
  name: string;
  dmc: string;
  hex: string;
  rgb?: number;
}

export interface Stitch {
  row: number;
  col: number;
  colorIdx: number;
}

export interface Pattern {
  title: string;
  width: number;
  height: number;
  colors: Record<number, ColorInfo>;
  stitches: Stitch[];
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  width: number;
  height: number;
  pattern_data: any;
  done_keys: string[];
  created_at: string;
  updated_at: string;
}
