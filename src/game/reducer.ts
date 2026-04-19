import { createDeck, describeCard, shuffleDeck, SUIT_META, SUIT_ORDER } from './cards'
import type {
  Checkpoint,
  GameAction,
  GameState,
  Horse,
  RevealEvent,
  Suit,
  TurnLog,
} from './types'

export const DEFAULT_SEGMENTS = 7
export const MIN_SEGMENTS = 4
export const MAX_SEGMENTS = 10

function createHorses(): Horse[] {
  return SUIT_ORDER.map((suit) => ({ suit, position: 0 }))
}

export function setupGame(segmentCount: number): GameState {
  const deck = shuffleDeck(createDeck())
  const checkpoints: Checkpoint[] = deck.slice(0, segmentCount).map((card, index) => ({
    index: index + 1,
    card,
    revealed: false,
    triggeredAtTurn: null,
  }))

  return {
    phase: 'ready',
    segmentCount,
    horses: createHorses(),
    checkpoints,
    drawDeck: deck.slice(segmentCount),
    discardPile: [],
    currentDraw: null,
    winner: null,
    turn: 0,
    logs: [],
  }
}

function updateHorsePosition(horses: Horse[], suit: Suit, delta: number): Horse[] {
  return horses.map((horse) => {
    if (horse.suit !== suit) {
      return horse
    }

    return {
      ...horse,
      position: Math.max(0, horse.position + delta),
    }
  })
}

function findRevealableCheckpoint(state: GameState): Checkpoint | null {
  for (const checkpoint of state.checkpoints) {
    if (checkpoint.revealed) {
      continue
    }

    const everyonePassed = state.horses.every((horse) => horse.position > checkpoint.index)
    if (everyonePassed) {
      return checkpoint
    }
  }

  return null
}

function determineWinner(state: GameState): Suit | null {
  const finishLine = state.segmentCount + 1
  const winner = state.horses.find((horse) => horse.position >= finishLine)
  return winner?.suit ?? null
}

function createNarration(log: TurnLog): string {
  const suitMeta = SUIT_META[log.movedHorse]
  const base = `${log.turn}턴: ${describeCard(log.drawCard)}가 나와 ${suitMeta.label} 말이 ${log.movedTo}칸으로 전진`

  if (log.reveals.length === 0) {
    return base
  }

  const revealText = log.reveals
    .map((reveal) => {
      const revealSuitMeta = SUIT_META[reveal.penalizedHorse]
      return `${reveal.checkpointIndex}구간 공개 ${describeCard(reveal.card)}, ${revealSuitMeta.label} 말 ${reveal.penalizedTo}칸으로 후진`
    })
    .join(' / ')

  return `${base} | ${revealText}`
}

export function getLatestMessages(state: GameState): string[] {
  return state.logs
    .slice()
    .reverse()
    .slice(0, 8)
    .map((log) => createNarration(log))
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'set_segments':
      return setupGame(action.segmentCount)

    case 'reset':
      return setupGame(action.segmentCount ?? state.segmentCount)

    case 'start':
      if (state.phase !== 'ready') {
        return state
      }

      return {
        ...state,
        phase: 'playing',
      }

    case 'play_turn': {
      if (state.phase === 'finished') {
        return state
      }

      if (state.phase === 'ready') {
        state = {
          ...state,
          phase: 'playing',
        }
      }

      const nextCard = state.drawDeck[0]
      if (!nextCard) {
        return {
          ...state,
          phase: 'finished',
          currentDraw: null,
        }
      }

      const nextTurn = state.turn + 1
      let nextState: GameState = {
        ...state,
        turn: nextTurn,
        currentDraw: nextCard,
        drawDeck: state.drawDeck.slice(1),
        discardPile: [...state.discardPile, nextCard],
        horses: updateHorsePosition(state.horses, nextCard.suit, 1),
      }
      const movedHorseAfterAdvance = nextState.horses.find((horse) => horse.suit === nextCard.suit)!

      const reveals: RevealEvent[] = []

      while (true) {
        const revealable = findRevealableCheckpoint(nextState)
        if (!revealable) {
          break
        }

        nextState = {
          ...nextState,
          checkpoints: nextState.checkpoints.map((checkpoint) =>
            checkpoint.index === revealable.index
              ? { ...checkpoint, revealed: true, triggeredAtTurn: nextTurn }
              : checkpoint,
          ),
          horses: updateHorsePosition(nextState.horses, revealable.card.suit, -1),
        }

        const penalizedHorse = nextState.horses.find((horse) => horse.suit === revealable.card.suit)!

        reveals.push({
          checkpointIndex: revealable.index,
          card: revealable.card,
          penalizedHorse: revealable.card.suit,
          penalizedTo: penalizedHorse.position,
        })
      }

      const winner = determineWinner(nextState)
      const completed = winner !== null || nextState.drawDeck.length === 0

      const nextLog: TurnLog = {
        turn: nextTurn,
        drawCard: nextCard,
        movedHorse: nextCard.suit,
        movedTo: movedHorseAfterAdvance.position,
        reveals,
      }

      return {
        ...nextState,
        winner,
        phase: completed ? 'finished' : 'playing',
        logs: [...nextState.logs, nextLog],
      }
    }

    default:
      return state
  }
}
