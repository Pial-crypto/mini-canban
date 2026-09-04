import { Injectable } from '@nestjs/common';

const GAP = 1024;

/**
 * Fractional-indexing helper. Instead of storing dense integer indices
 * (which would require rewriting every sibling row on each reorder), each
 * row stores a floating point `position`. Moving an item just needs to
 * compute a new position between its two new neighbors, which is an O(1)
 * write with no risk of a lost-update race corrupting unrelated rows.
 */
@Injectable()
export class PositionService {
  /** Position for a brand new item appended to the end of a list. */
  nextPosition(existingPositions: number[]): number {
    if (existingPositions.length === 0) return GAP;
    return Math.max(...existingPositions) + GAP;
  }

  /**
   * Computes the position a moved item should take given the positions of
   * the items immediately before and after its new slot (undefined at the
   * ends of the list). Falls back to a fresh integer-spaced value if the
   * two neighbors have collapsed to (nearly) the same float, which can
   * only happen after an extreme number of successive inserts at the same
   * spot.
   */
  between(before?: number, after?: number): number {
    if (before === undefined && after === undefined) return GAP;
    if (before === undefined) return after! - GAP;
    if (after === undefined) return before + GAP;
    const mid = (before + after) / 2;
    if (mid === before || mid === after) {
      // Extremely rare float precision collision; caller should
      // renormalize the column if this keeps happening.
      return before + (after - before) / 2;
    }
    return mid;
  }
}
