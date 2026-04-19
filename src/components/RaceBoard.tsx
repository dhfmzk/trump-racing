import type { CSSProperties } from 'react'
import { CardFace } from './CardFace'
import { SUIT_META, SUIT_ORDER } from '../game/cards'
import type { Checkpoint, Horse, TurnLog } from '../game/types'

type RaceBoardProps = {
  horses: Horse[]
  checkpoints: Checkpoint[]
  segmentCount: number
  latestTurn: TurnLog | null
}

export function RaceBoard({ horses, checkpoints, segmentCount, latestTurn }: RaceBoardProps) {
  const columns = Array.from({ length: segmentCount + 2 }, (_, index) => index)
  const columnStyle = { '--column-count': columns.length } as CSSProperties
  const penalizedSuits = new Set(latestTurn?.reveals.map((reveal) => reveal.penalizedHorse) ?? [])
  const revealedCheckpoints = new Set(latestTurn?.reveals.map((reveal) => reveal.checkpointIndex) ?? [])

  return (
    <section className="board-shell">
      <div className="checkpoint-strip">
        <div className="checkpoint-strip-title">
          <p>숨겨진 체크포인트</p>
          <span>모든 말이 구간을 지나면 카드가 공개되고 같은 무늬 말이 후진합니다.</span>
        </div>
        <div className="checkpoint-list">
          {checkpoints.map((checkpoint) => (
            <div
              key={checkpoint.index}
              className={`checkpoint-slot ${revealedCheckpoints.has(checkpoint.index) ? 'checkpoint-slot-live' : ''}`}
            >
              <span className="checkpoint-label">구간 {checkpoint.index}</span>
              <CardFace card={checkpoint.card} hidden={!checkpoint.revealed} compact />
            </div>
          ))}
        </div>
      </div>

      <div className="board-grid">
        <div className="board-header" style={columnStyle}>
          {columns.map((column) => {
            let label = `구간 ${column}`
            if (column === 0) {
              label = '출발'
            }
            if (column === segmentCount + 1) {
              label = '도착'
            }

            return (
              <div key={column} className="board-cell board-header-cell">
                {label}
              </div>
            )
          })}
        </div>

        {SUIT_ORDER.map((suit) => {
          const horse = horses.find((entry) => entry.suit === suit)!
          const meta = SUIT_META[suit]

          return (
            <div
              key={suit}
              className={`track-row ${latestTurn?.movedHorse === suit ? 'track-row-moved' : ''} ${penalizedSuits.has(suit) ? 'track-row-penalized' : ''}`}
            >
              <div className="track-label" style={{ '--lane-accent': meta.color } as CSSProperties}>
                <strong>
                  {meta.symbol} {meta.label}
                </strong>
                <span>{meta.laneName} 레인</span>
              </div>

              <div className="track-lane" style={columnStyle}>
                {columns.map((column) => {
                  const occupied = horse.position === column
                  const isFinish = column === segmentCount + 1

                  return (
                    <div
                      key={column}
                      className={`board-cell track-cell ${isFinish ? 'track-cell-finish' : ''}`}
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
    </section>
  )
}
