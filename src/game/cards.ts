import type { Card, Suit } from './types'

export const SUIT_ORDER: Suit[] = ['spade', 'heart', 'diamond', 'club']

export const SUIT_META: Record<
  Suit,
  { label: string; symbol: string; color: string; light: string; laneName: string }
> = {
  spade: {
    label: '스페이드',
    symbol: '♠',
    color: '#f8fafc',
    light: 'rgba(248, 250, 252, 0.2)',
    laneName: '흑철',
  },
  heart: {
    label: '하트',
    symbol: '♥',
    color: '#fb7185',
    light: 'rgba(251, 113, 133, 0.2)',
    laneName: '장미',
  },
  diamond: {
    label: '다이아',
    symbol: '♦',
    color: '#fbbf24',
    light: 'rgba(251, 191, 36, 0.2)',
    laneName: '황금',
  },
  club: {
    label: '클로버',
    symbol: '♣',
    color: '#34d399',
    light: 'rgba(52, 211, 153, 0.2)',
    laneName: '초원',
  },
}

const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export function createDeck(): Card[] {
  return SUIT_ORDER.flatMap((suit) => RANKS.map((rank) => ({ suit, rank })))
}

export function shuffleDeck(cards: Card[]): Card[] {
  const next = [...cards]

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  }

  return next
}

export function describeCard(card: Card): string {
  const meta = SUIT_META[card.suit]
  return `${meta.symbol} ${card.rank}`
}
