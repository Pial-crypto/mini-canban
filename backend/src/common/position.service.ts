import { Injectable } from '@nestjs/common';

const GAP = 1024;


@Injectable()
export class PositionService {
 
  nextPosition(existingPositions: number[]): number {
    if (existingPositions.length === 0) return GAP;
    return Math.max(...existingPositions) + GAP;
  }

 
  between(before?: number, after?: number): number {
    // console.log('between', { before, after });
    if (before === undefined && after === undefined) return GAP;
    if (before === undefined) return after! - GAP;
    if (after === undefined) return before + GAP;
    const mid = (before + after) / 2;
    if (mid === before || mid === after) {
      // console.log("i am inside mid")
   
      return before + (after - before) / 2;
    }
    return mid;
  }
}
