/**
 * WordGrid — Responsive CSS Grid for the word puzzle
 *
 * Tile size is computed from the actual available space (both width
 * AND height) via ResizeObserver, so the grid always fits its
 * container exactly — it can never grow taller than the space it's
 * given and can never overlap the category label above or the
 * keyboard below, regardless of word length (4-8 letters) or screen
 * size.
 *
 * Tile colors use the shared --tile-* CSS variables (defined once in
 * index.css) so the grid and the on-screen keyboard always agree.
 */

import { useLayoutEffect, useRef, useState } from "react";
import type { Row, Tile, TileState } from "@/hooks/useWordPoolGame";

interface WordGridProps {
  rows: Row[];
  wordLength: number;
}

const GAP = 8; // px, matches gap-2 below
const MAX_TILE = 62;
const MIN_TILE = 30;

function getTileColors(state: TileState): string {
  switch (state) {
    case "correct":
      return "bg-tile-correct border-tile-correct-border text-white";
    case "present":
      return "bg-tile-present border-tile-present-border text-white";
    case "absent":
      return "bg-tile-absent border-tile-absent-border text-white";
    case "typing":
      return "bg-accent border-primary text-primary";
    case "empty":
      return "bg-card border-border";
  }
}

function getEvaluatedColorClass(state: TileState): string {
  switch (state) {
    case "correct":
      return "eval-correct";
    case "present":
      return "eval-present";
    case "absent":
      return "eval-absent";
    default:
      return "";
  }
}

export function WordGrid({ rows, wordLength }: WordGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState(MAX_TILE);
  const rowCount = rows.length;

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const compute = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      const widthFit = (width - GAP * (wordLength - 1)) / wordLength;
      const heightFit = (height - GAP * (rowCount - 1)) / rowCount;
      const size = Math.floor(Math.min(widthFit, heightFit, MAX_TILE));

      setTileSize(Math.max(MIN_TILE, size));
    };

    compute();

    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener("resize", compute);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [wordLength, rowCount]);

  const gridWidth = tileSize * wordLength + GAP * (wordLength - 1);
  const fontSize = Math.max(14, Math.round(tileSize * 0.42));

  return (
    <div ref={containerRef} className="w-full h-full min-h-0 flex items-center justify-center overflow-hidden">
      <div
        className="flex flex-col"
        style={{ gap: GAP, width: gridWidth }}
      >
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${wordLength}, ${tileSize}px)`,
              gap: GAP,
            }}
          >
            {row.tiles.map((tile, tileIdx) => (
              <TileCell
                key={`${rowIdx}-${tileIdx}`}
                tile={tile}
                tileIdx={tileIdx}
                wordLength={wordLength}
                isEvaluated={row.evaluated}
                rowIdx={rowIdx}
                size={tileSize}
                fontSize={fontSize}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface TileCellProps {
  tile: Tile;
  tileIdx: number;
  wordLength: number;
  isEvaluated: boolean;
  rowIdx: number;
  size: number;
  fontSize: number;
}

function TileCell({ tile, tileIdx, wordLength, isEvaluated, rowIdx, size, fontSize }: TileCellProps) {
  const isFlipping = isEvaluated && (tile.state === "correct" || tile.state === "present" || tile.state === "absent");

  const colorClass = getTileColors(tile.state);

  return (
    <div
      className={`
        flex items-center justify-center
        border-2 rounded-xl font-display font-bold select-none
        ${isFlipping ? "tile-flipping" : ""}
        ${isFlipping ? getEvaluatedColorClass(tile.state) : colorClass}
      `}
      style={{
        width: size,
        height: size,
        fontSize,
        ...(isFlipping
          ? { animationDelay: `${rowIdx * wordLength * 80 + tileIdx * 80}ms` }
          : {}),
      }}
    >
      {tile.letter && (
        <span className={tile.state === "typing" ? "tile-pop" : ""}>
          {tile.letter}
        </span>
      )}
    </div>
  );
}
