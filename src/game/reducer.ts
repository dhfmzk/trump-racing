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

function pickLine(lines: string[], seed: number): string {
  return lines[seed % lines.length]
}

function createAdvanceNarration(log: TurnLog): string {
  const suitMeta = SUIT_META[log.movedHorse]
  const cardText = describeCard(log.drawCard)

  return pickLine(
    [
      `${cardText}, 치고 나가는 ${suitMeta.label}! ${log.movedTo}칸까지 단숨에 올라섭니다.`,
      `${cardText}가 뜨자 ${suitMeta.label} 발걸음이 빨라집니다. ${log.movedTo}칸 통과!`,
      `${cardText} 확인과 동시에 ${suitMeta.label}가 한 번 더 탄력을 받습니다! 이제 ${log.movedTo}칸.`,
      `${cardText}입니다. 이때 ${suitMeta.label}가 앞으로 길게 뻗어 나갑니다! ${log.movedTo}칸.`,
      `${cardText}, ${suitMeta.label}가 흐름을 잡습니다. ${log.movedTo}칸까지 먼저 밀어 올리네요.`,
    ],
    log.turn + log.movedTo,
  )
}

function createRevealNarration(turn: number, reveal: RevealEvent): string {
  const penalizedMeta = SUIT_META[reveal.penalizedHorse]
  const cardText = describeCard(reveal.card)

  return pickLine(
    [
      `${reveal.checkpointIndex}구간 카드 공개, ${cardText}! ${penalizedMeta.label} 쪽에 제동이 걸립니다. ${reveal.penalizedTo}칸으로 한 칸 물러섭니다.`,
      `${reveal.checkpointIndex}구간이 열립니다. ${cardText}가 숨어 있었군요. ${penalizedMeta.label}, 여기서 잠깐 주춤합니다!`,
      `${reveal.checkpointIndex}구간 확인됐습니다. ${cardText}! 이때 거리를 내주는 ${penalizedMeta.label}, ${reveal.penalizedTo}칸으로 내려옵니다.`,
      `${reveal.checkpointIndex}구간 카드가 모습을 드러냅니다. ${cardText}, ${penalizedMeta.label}에게는 아쉬운 장면입니다.`,
      `${reveal.checkpointIndex}구간 공개 순간 ${cardText}! ${penalizedMeta.label}가 여기서 한 템포 밀립니다.`,
    ],
    turn + reveal.checkpointIndex + reveal.penalizedTo,
  )
}

export function getLatestMessages(state: GameState): string[] {
  return state.logs
    .flatMap((log) => [
      createAdvanceNarration(log),
      ...log.reveals.map((reveal) => createRevealNarration(log.turn, reveal)),
    ])
    .slice()
    .reverse()
    .slice(0, 8)
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
      if (state.phase === 'finished' || state.phase === 'revealing') {
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
      const hasRevealPhase = findRevealableCheckpoint(nextState) !== null
      const winner = hasRevealPhase ? null : determineWinner(nextState)
      const completed = !hasRevealPhase && (winner !== null || nextState.drawDeck.length === 0)

      const nextLog: TurnLog = {
        turn: nextTurn,
        drawCard: nextCard,
        movedHorse: nextCard.suit,
        movedTo: movedHorseAfterAdvance.position,
        reveals: [],
      }

      return {
        ...nextState,
        winner,
        phase: hasRevealPhase ? 'revealing' : completed ? 'finished' : 'playing',
        logs: [...nextState.logs, nextLog],
      }
    }

    case 'resolve_reveal': {
      if (state.phase !== 'revealing') {
        return state
      }

      const revealable = findRevealableCheckpoint(state)
      if (!revealable) {
        const winner = determineWinner(state)
        const completed = winner !== null || state.drawDeck.length === 0

        return {
          ...state,
          winner,
          phase: completed ? 'finished' : 'playing',
        }
      }

      const nextHorses = updateHorsePosition(state.horses, revealable.card.suit, -1)
      const penalizedHorse = nextHorses.find((horse) => horse.suit === revealable.card.suit)!
      const revealEvent: RevealEvent = {
        checkpointIndex: revealable.index,
        card: revealable.card,
        penalizedHorse: revealable.card.suit,
        penalizedTo: penalizedHorse.position,
      }

      const nextLogs = state.logs.map((log, index) =>
        index === state.logs.length - 1
          ? {
              ...log,
              reveals: [...log.reveals, revealEvent],
            }
          : log,
      )

      const nextState: GameState = {
        ...state,
        checkpoints: state.checkpoints.map((checkpoint) =>
          checkpoint.index === revealable.index
            ? { ...checkpoint, revealed: true, triggeredAtTurn: state.turn }
            : checkpoint,
        ),
        horses: nextHorses,
        logs: nextLogs,
      }

      const hasMoreReveals = findRevealableCheckpoint(nextState) !== null
      if (hasMoreReveals) {
        return nextState
      }

      const winner = determineWinner(nextState)
      const completed = winner !== null || nextState.drawDeck.length === 0

      return {
        ...nextState,
        winner,
        phase: completed ? 'finished' : 'playing',
      }
    }

    default:
      return state
  }
}
