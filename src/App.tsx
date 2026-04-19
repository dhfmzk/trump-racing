import { useEffect, useReducer, useState } from 'react'
import { ControlPanel, type SpeedMode } from './components/ControlPanel'
import { InfoPanel } from './components/InfoPanel'
import { RaceBoard } from './components/RaceBoard'
import { SessionPanel, type SessionRecord } from './components/SessionPanel'
import { SUIT_META } from './game/cards'
import { DEFAULT_SEGMENTS, gameReducer, setupGame } from './game/reducer'
import type { CSSProperties } from 'react'
import type { Suit } from './game/types'

const SPEED_INTERVALS: Record<SpeedMode, number> = {
  normal: 1200,
  fast: 450,
  instant: 120,
}
const STARTING_BANKROLL = 1000
const BET_COST = 100
const BET_REWARD = 300

type SessionState = {
  bankroll: number
  roundsPlayed: number
  correctBets: number
  streak: number
  bestStreak: number
  history: SessionRecord[]
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, DEFAULT_SEGMENTS, setupGame)
  const [autoPlay, setAutoPlay] = useState(false)
  const [speed, setSpeed] = useState<SpeedMode>('normal')
  const [selectedBet, setSelectedBet] = useState<Suit | null>('heart')
  const [roundNumber, setRoundNumber] = useState(1)
  const [settledRound, setSettledRound] = useState<number | null>(null)
  const [session, setSession] = useState<SessionState>({
    bankroll: STARTING_BANKROLL,
    roundsPlayed: 0,
    correctBets: 0,
    streak: 0,
    bestStreak: 0,
    history: [],
  })

  useEffect(() => {
    if (!autoPlay || state.phase === 'finished') {
      return undefined
    }

    const timer = window.setInterval(() => {
      dispatch({ type: 'play_turn' })
    }, SPEED_INTERVALS[speed])

    return () => window.clearInterval(timer)
  }, [autoPlay, speed, state.phase])

  useEffect(() => {
    if (state.phase === 'finished') {
      setAutoPlay(false)
    }
  }, [state.phase])

  useEffect(() => {
    if (state.phase !== 'finished' || settledRound === roundNumber) {
      return
    }

    const isCorrect = Boolean(selectedBet && state.winner && selectedBet === state.winner)
    const payout = selectedBet ? (isCorrect ? BET_REWARD : -BET_COST) : 0

    setSession((current) => {
      const nextStreak = isCorrect ? current.streak + 1 : 0
      const nextRecord: SessionRecord = {
        round: roundNumber,
        bet: selectedBet,
        winner: state.winner,
        payout,
        turns: state.turn,
      }

      return {
        bankroll: current.bankroll + payout,
        roundsPlayed: current.roundsPlayed + 1,
        correctBets: current.correctBets + (isCorrect ? 1 : 0),
        streak: nextStreak,
        bestStreak: Math.max(current.bestStreak, nextStreak),
        history: [nextRecord, ...current.history],
      }
    })

    setSettledRound(roundNumber)
  }, [roundNumber, selectedBet, settledRound, state.phase, state.turn, state.winner])

  const winnerMeta = state.winner ? SUIT_META[state.winner] : null
  const latestTurn = state.logs.at(-1) ?? null

  function resetRound(options?: { nextSegmentCount?: number; advanceRound?: boolean }) {
    setAutoPlay(false)
    setSettledRound(null)
    if (options?.advanceRound) {
      setRoundNumber((current) => current + 1)
    }

    dispatch({ type: 'reset', segmentCount: options?.nextSegmentCount })
  }

  return (
    <main className="app-shell">
      <section className="app-hero">
        <div className="hero-copy">
          <p className="eyebrow">WALDOON STYLE CARD RACE</p>
          <h1>트럼프 경마</h1>
          <p className="hero-description">
            52장 카드 덱으로 4마리의 말을 달리게 하는 시청형 경마 게임입니다. 드로우된 카드의 무늬가
            말을 전진시키고, 모든 말이 체크포인트를 지나면 숨겨진 카드가 공개되어 같은 무늬 말을 뒤로
            끌어당깁니다.
          </p>
        </div>

        <div className="hero-outcome">
          <span className="hero-pill">라운드 {roundNumber}</span>
          <span className="hero-pill">{state.segmentCount}구간 레이스</span>
          <span className="hero-pill">{state.drawDeck.length}장 남음</span>
          <span className="hero-pill">베팅 {selectedBet ? `${SUIT_META[selectedBet].symbol} ${SUIT_META[selectedBet].label}` : '없음'}</span>
          {winnerMeta ? (
            <div className="winner-callout" style={{ '--winner-accent': winnerMeta.color } as CSSProperties}>
              <p>우승</p>
              <strong>
                {winnerMeta.symbol} {winnerMeta.label}
              </strong>
            </div>
          ) : (
            <div className="winner-callout winner-waiting">
              <p>현재 상황</p>
              <strong>{state.phase === 'ready' ? '출발 대기' : '판세 진행 중'}</strong>
            </div>
          )}
        </div>
      </section>

      <section className="dashboard-grid">
        <InfoPanel state={state} />
        <ControlPanel
          state={state}
          autoPlay={autoPlay}
          speed={speed}
          selectedBet={selectedBet}
          onStart={() => dispatch({ type: 'start' })}
          onPlayTurn={() => dispatch({ type: 'play_turn' })}
          onReset={() => resetRound({ advanceRound: state.turn > 0 || state.phase === 'finished' })}
          onNextRound={() => resetRound({ advanceRound: true })}
          onToggleAutoPlay={() => {
            if (state.phase === 'finished') {
              return
            }

            if (state.phase === 'ready') {
              dispatch({ type: 'start' })
            }

            setAutoPlay((current) => !current)
          }}
          onSpeedChange={setSpeed}
          onSegmentChange={(segmentCount) => {
            resetRound({
              nextSegmentCount: segmentCount,
              advanceRound: state.turn > 0 || state.phase === 'finished',
            })
          }}
          onBetChange={setSelectedBet}
        />
      </section>

      <section className="lower-grid">
        <RaceBoard
          horses={state.horses}
          checkpoints={state.checkpoints}
          segmentCount={state.segmentCount}
          latestTurn={latestTurn}
        />
        <SessionPanel
          bankroll={session.bankroll}
          roundsPlayed={session.roundsPlayed}
          correctBets={session.correctBets}
          streak={session.streak}
          bestStreak={session.bestStreak}
          history={session.history}
        />
      </section>

      {state.phase === 'finished' ? (
        <section className="result-overlay">
          <div className="result-modal">
            <p className="eyebrow">Round Result</p>
            <h2>{winnerMeta ? `${winnerMeta.symbol} ${winnerMeta.label} 우승` : '승자 없이 종료'}</h2>
            <p>
              {selectedBet
                ? winnerMeta && selectedBet === state.winner
                  ? `예측 적중! ${BET_REWARD}칩을 획득했습니다.`
                  : `예측 실패. ${BET_COST}칩을 잃었습니다.`
                : '이번 라운드는 베팅 없이 진행했습니다.'}
            </p>
            <div className="result-modal-actions">
              <button type="button" className="button-primary" onClick={() => resetRound({ advanceRound: true })}>
                다음 라운드
              </button>
              <button type="button" className="button-ghost" onClick={() => resetRound()}>
                같은 라운드 다시
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}
