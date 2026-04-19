import type { CSSProperties } from 'react'
import { describeCard, SUIT_META } from '../game/cards'
import type { Card } from '../game/types'

type CardFaceProps = {
  card: Card | null
  hidden?: boolean
  compact?: boolean
}

export function CardFace({ card, hidden = false, compact = false }: CardFaceProps) {
  if (hidden) {
    return (
      <div className={`card-face ${compact ? 'card-face-compact' : ''} card-back`}>
        <div className="card-back-pattern" />
      </div>
    )
  }

  if (!card) {
    return (
      <div className={`card-face ${compact ? 'card-face-compact' : ''} card-empty`}>
        대기 중
      </div>
    )
  }

  const meta = SUIT_META[card.suit]

  return (
    <div
      className={`card-face ${compact ? 'card-face-compact' : ''}`}
      style={{ '--card-accent': meta.color } as CSSProperties}
    >
      <div className="card-corner">
        <span>{card.rank}</span>
        <span>{meta.symbol}</span>
      </div>
      <div className="card-center">{describeCard(card)}</div>
      <div className="card-corner card-corner-bottom">
        <span>{meta.symbol}</span>
        <span>{card.rank}</span>
      </div>
    </div>
  )
}
