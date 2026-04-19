import { useEffect, useMemo, useReducer, useState } from 'react'
import { RaceBoard } from './components/RaceBoard'
import { SUIT_META } from './game/cards'
import { DEFAULT_SEGMENTS, gameReducer, getLatestMessages, MAX_SEGMENTS, MIN_SEGMENTS, setupGame } from './game/reducer'

type SpeedMode = 'normal' | 'fast' | 'instant'

const SPEED_INTERVALS: Record<SpeedMode, number> = {
  normal: 1200,
  fast: 450,
  instant: 120,
}

const REVEAL_INTERVALS: Record<SpeedMode, number> = {
  normal: 900,
  fast: 320,
  instant: 120,
}

export default function App() {
  const [state, dispatch] = useReducer(gameReducer, DEFAULT_SEGMENTS, setupGame)
  const [autoPlay, setAutoPlay] = useState(false)
  const [speed, setSpeed] = useState<SpeedMode>('normal')
  const [roundNumber, setRoundNumber] = useState(1)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    if (!autoPlay || state.phase === 'finished') {
      return undefined
    }

    const timer = window.setInterval(
      () => {
        dispatch({ type: state.phase === 'revealing' ? 'resolve_reveal' : 'play_turn' })
      },
      state.phase === 'revealing' ? REVEAL_INTERVALS[speed] : SPEED_INTERVALS[speed],
    )

    return () => window.clearInterval(timer)
  }, [autoPlay, speed, state.phase])

  useEffect(() => {
    if (state.phase === 'finished') {
      setAutoPlay(false)
    }
  }, [state.phase])

  const winnerMeta = state.winner ? SUIT_META[state.winner] : null
  const latestTurn = state.logs.at(-1) ?? null
  const overlayLogs = useMemo(() => getLatestMessages(state).slice(0, 3), [state])

  function resetRound(options?: { nextSegmentCount?: number; advanceRound?: boolean }) {
    setAutoPlay(false)

    if (options?.advanceRound) {
      setRoundNumber((current) => current + 1)
    }

    dispatch({ type: 'reset', segmentCount: options?.nextSegmentCount })
  }

  function handleToggleAuto() {
    if (state.phase === 'finished') {
      return
    }

    if (autoPlay) {
      setAutoPlay(false)
      return
    }

    if (state.phase === 'ready') {
      dispatch({ type: 'start' })
      dispatch({ type: 'play_turn' })
    }

    setAutoPlay(true)
  }

  function handlePrimaryAction() {
    if (state.phase === 'ready') {
      dispatch({ type: 'start' })
      dispatch({ type: 'play_turn' })
      return
    }

    if (state.phase === 'playing') {
      dispatch({ type: 'play_turn' })
      return
    }

    if (state.phase === 'revealing') {
      dispatch({ type: 'resolve_reveal' })
      return
    }

    resetRound({ advanceRound: true })
  }

  function getPrimaryLabel(): string {
    if (state.phase === 'ready') {
      return '경기 시작'
    }

    if (state.phase === 'playing') {
      return '다음 턴'
    }

    if (state.phase === 'revealing') {
      return '체크포인트 공개'
    }

    return '다음 라운드'
  }

  return (
    <main className="game-shell">
      <section className="arena-frame">
        <div className="top-hud">
          <div className="hud-cluster">
            <span className="hud-badge">Round {roundNumber}</span>
            <span className="hud-badge">Turn {state.turn}</span>
            <span className="hud-badge">{state.drawDeck.length} cards left</span>
            <span className="hud-badge hud-badge-subtle">
              {state.currentDraw ? `현재 ${SUIT_META[state.currentDraw.suit].symbol} ${state.currentDraw.rank}` : '카드 대기'}
            </span>
          </div>
        </div>

        <div className="arena-stage">
          <RaceBoard
            horses={state.horses}
            checkpoints={state.checkpoints}
            segmentCount={state.segmentCount}
            latestTurn={latestTurn}
            overlayLogs={overlayLogs}
          />

          {state.phase === 'finished' ? (
            <div className="finish-overlay">
              <div className="finish-card">
                <p className="eyebrow">Finish</p>
                <h2>{winnerMeta ? `${winnerMeta.symbol} ${winnerMeta.label} 우승!` : '승자 없이 종료'}</h2>
                <p>
                  {winnerMeta
                    ? `${winnerMeta.label} 말이 결승선을 가장 먼저 통과했습니다.`
                    : '남은 덱이 모두 소진되어 승자 없이 종료되었습니다.'}
                </p>
                <div className="finish-actions">
                  <button type="button" className="action-button action-button-primary" onClick={() => resetRound({ advanceRound: true })}>
                    다음 라운드
                  </button>
                  <button type="button" className="action-button" onClick={() => resetRound()}>
                    같은 판 다시
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className={`bottom-sheet ${sheetOpen ? 'bottom-sheet-open' : ''}`}>
        <div className="bottom-sheet-preview">
          <button
            type="button"
            className="bottom-sheet-handle"
            aria-label={sheetOpen ? '상세 패널 접기' : '상세 패널 열기'}
            onClick={() => setSheetOpen((current) => !current)}
          >
            <span />
          </button>

          <div className="preview-actions">
            <button
              type="button"
              className="action-button action-button-primary"
              onClick={handlePrimaryAction}
            >
              {getPrimaryLabel()}
            </button>
          </div>
        </div>

        <div className="sheet-content">
          <div className="sheet-block">
            <p className="eyebrow">현재 경기</p>
            <div className="sheet-stats">
              <article className="sheet-stat">
                <span>현재 카드</span>
                <strong>{state.currentDraw ? `${SUIT_META[state.currentDraw.suit].symbol} ${state.currentDraw.rank}` : '대기 중'}</strong>
              </article>
              <article className="sheet-stat">
                <span>남은 덱</span>
                <strong>{state.drawDeck.length}</strong>
              </article>
              <article className="sheet-stat">
                <span>구간 수</span>
                <strong>{state.segmentCount}</strong>
              </article>
              <article className="sheet-stat">
                <span>속도</span>
                <strong>{speed === 'normal' ? '일반' : speed === 'fast' ? '빠름' : '즉시'}</strong>
              </article>
            </div>
          </div>

          <div className="sheet-block">
            <p className="eyebrow">설정</p>
            <div className="sheet-controls">
              <label className="sheet-range">
                <span>구간 수</span>
                <div className="sheet-range-row">
                  <input
                    type="range"
                    min={MIN_SEGMENTS}
                    max={MAX_SEGMENTS}
                    value={state.segmentCount}
                    onChange={(event) =>
                      resetRound({
                        nextSegmentCount: Number(event.target.value),
                        advanceRound: state.turn > 0 || state.phase === 'finished',
                      })
                    }
                  />
                  <strong>{state.segmentCount}</strong>
                </div>
              </label>

              <div className="sheet-speed">
                <button
                  type="button"
                  className={`sheet-speed-button ${autoPlay ? 'sheet-speed-button-active' : ''}`}
                  onClick={handleToggleAuto}
                  disabled={state.phase === 'finished'}
                >
                  {autoPlay ? '자동 진행 켜짐' : '자동 진행'}
                </button>
                {[
                  ['normal', '일반'],
                  ['fast', '빠름'],
                  ['instant', '즉시'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`sheet-speed-button ${speed === value ? 'sheet-speed-button-active' : ''}`}
                    onClick={() => setSpeed(value as SpeedMode)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
