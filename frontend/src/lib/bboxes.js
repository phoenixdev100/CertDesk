// Bounding boxes for placed fields, used for hit-testing during drag.
// Stored outside React/Zustand state so updating them never triggers
// a re-render (which would cause an infinite loop in the canvas effect).

const bboxes = [];

export function setBboxes(next) {
  bboxes.length = 0;
  bboxes.push(...next);
}

export function getBboxes() {
  return bboxes;
}

export function hitTest(cx, cy) {
  for (let i = bboxes.length - 1; i >= 0; i--) {
    const b = bboxes[i];
    if (!b) continue;
    const pad = 10;
    if (cx >= b.x1 - pad && cx <= b.x2 + pad && cy >= b.y1 - pad && cy <= b.y2 + pad) {
      return i;
    }
  }
  return -1;
}
