import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { CardFace } from './CardFace'
import { SUIT_META, SUIT_ORDER } from '../game/cards'
import type { Checkpoint, Horse, TurnLog } from '../game/types'

type RaceBoardProps = {
  horses: Horse[]
  checkpoints: Checkpoint[]
  segmentCount: number
  latestTurn: TurnLog | null
  overlayLogs: string[]
}

export function RaceBoard({
  horses,
  checkpoints,
  segmentCount,
  latestTurn,
  overlayLogs,
}: RaceBoardProps) {
  const rows = Array.from({ length: segmentCount + 2 }, (_, index) => segmentCount + 1 - index)
  const laneStyle = { '--lane-count': SUIT_ORDER.length } as CSSProperties
  const penalizedSuits = new Set(latestTurn?.reveals.map((reveal) => reveal.penalizedHorse) ?? [])
  const checkpointsByIndex = new Map(checkpoints.map((checkpoint) => [checkpoint.index, checkpoint]))
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const focusRow = Math.max(...horses.map((horse) => horse.position))

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) {
      return
    }

    const target = viewport.querySelector<HTMLElement>(`[data-row="${focusRow}"]`)
    if (!target) {
      return
    }

    target.scrollIntoView({
      block: focusRow >= segmentCount ? 'start' : 'center',
      behavior: latestTurn ? 'smooth' : 'auto',
    })
  }, [focusRow, latestTurn, segmentCount])

  return (
    <section className="board-shell">
      <div className="board-atmosphere" />

      {overlayLogs.length > 0 ? (
        <div className="board-toast-stack">
          {overlayLogs.map((message, index) => (
            <div key={message} className={`board-toast board-toast-level-${index}`}>
              {message}
            </div>
          ))}
        </div>
      ) : null}

      <div className="board-scroll" ref={viewportRef}>
        <div className="vertical-board">
          <div className="board-head-row">
            <div className="board-corner board-cell board-header-cell">TRACK</div>
            <div className="board-head-lanes" style={laneStyle}>
              {SUIT_ORDER.map((suit) => {
                const meta = SUIT_META[suit]

                return (
                  <div
                    key={suit}
                    className="track-label track-label-head"
                    style={{ '--lane-accent': meta.color } as CSSProperties}
                  >
                    <strong>
                      {meta.symbol} {meta.label}
                    </strong>
                    <span>{meta.laneName}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {rows.map((row) => {
            const checkpoint = row >= 1 && row <= segmentCount ? checkpointsByIndex.get(row) ?? null : null

            return (
              <div key={row} className="board-row" data-row={row}>
                <div className="board-side">
                  <span className="board-row-label">{getRowLabel(row, segmentCount)}</span>
                  {checkpoint ? (
                    <div className="board-side-card">
                      <CardFace card={checkpoint.card} hidden={!checkpoint.revealed} compact />
                    </div>
                  ) : null}
                </div>

                <div className="board-row-lanes" style={laneStyle}>
                  {SUIT_ORDER.map((suit) => {
                  const horse = horses.find((entry) => entry.suit === suit)!
                  const meta = SUIT_META[suit]
                  const isMoved = latestTurn?.movedHorse === suit
                  const isPenalized = penalizedSuits.has(suit)
                  const occupied = horse.position === row
                    const isFinish = row === segmentCount + 1

                    return (
                      <div
                        key={`${suit}-${row}`}
                        className={`board-cell track-cell ${isFinish ? 'track-cell-finish' : ''} ${isMoved ? 'track-cell-moved' : ''} ${isPenalized ? 'track-cell-penalized' : ''}`}
                      >
                        {occupied ? (
                          <div
                            className="horse-token"
                            style={{ '--horse-accent': meta.color, '--horse-glow': meta.light } as CSSProperties}
                          >
                            <span className="horse-symbol">{meta.symbol}</span>
                            <span className="horse-name">{meta.laneName}</span>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function getRowLabel(row: number, segmentCount: number): string {
  if (row === segmentCount + 1) {
    return 'GOAL'
  }

  if (row === 0) {
    return 'START'
  }

  return `C${row}`
}
