export type Suit = 'spade' | 'heart' | 'diamond' | 'club'

export type Card = {
  suit: Suit
  rank: string
}

export type Horse = {
  suit: Suit
  position: number
}

export type Checkpoint = {
  index: number
  card: Card
  revealed: boolean
  triggeredAtTurn: number | null
}

export type RevealEvent = {
  checkpointIndex: number
  card: Card
  penalizedHorse: Suit
  penalizedTo: number
}

export type TurnLog = {
  turn: number
  drawCard: Card
  movedHorse: Suit
  movedTo: number
  reveals: RevealEvent[]
}

export type GamePhase = 'ready' | 'playing' | 'revealing' | 'finished'

export type GameState = {
  phase: GamePhase
  segmentCount: number
  horses: Horse[]
  checkpoints: Checkpoint[]
  drawDeck: Card[]
  discardPile: Card[]
  currentDraw: Card | null
  winner: Suit | null
  turn: number
  logs: TurnLog[]
}

export type GameAction =
  | { type: 'set_segments'; segmentCount: number }
  | { type: 'reset'; segmentCount?: number }
  | { type: 'start' }
  | { type: 'play_turn' }
  | { type: 'resolve_reveal' }
