import { SUIT_ORDER } from '../game/cards'
import { MAX_SEGMENTS, MIN_SEGMENTS } from '../game/reducer'
import { SUIT_META } from '../game/cards'
import type { GameState, Suit } from '../game/types'

type SpeedMode = 'normal' | 'fast' | 'instant'

type ControlPanelProps = {
  state: GameState
  autoPlay: boolean
  speed: SpeedMode
  selectedBet: Suit | null
  onStart: () => void
  onPlayTurn: () => void
  onReset: () => void
  onNextRound: () => void
  onToggleAutoPlay: () => void
  onSpeedChange: (speed: SpeedMode) => void
  onSegmentChange: (segmentCount: number) => void
  onBetChange: (suit: Suit) => void
}

export function ControlPanel({
  state,
  autoPlay,
  speed,
  selectedBet,
  onStart,
  onPlayTurn,
  onReset,
  onNextRound,
  onToggleAutoPlay,
  onSpeedChange,
  onSegmentChange,
  onBetChange,
}: ControlPanelProps) {
  const canPlay = state.phase !== 'finished'

  return (
    <section className="control-panel">
      <div className="panel-heading">
        <p className="eyebrow">조작</p>
        <h3>레이스 컨트롤</h3>
      </div>

      <div className="control-stack">
        <div className="bet-panel">
          <div className="bet-panel-copy">
            <span className="eyebrow">베팅</span>
            <strong>{selectedBet ? `${SUIT_META[selectedBet].label}에 100칩 베팅 중` : '아직 베팅하지 않았습니다'}</strong>
          </div>
          <div className="bet-grid">
            {SUIT_ORDER.map((suit) => {
              const meta = SUIT_META[suit]
              const active = selectedBet === suit

              return (
                <button
                  key={suit}
                  type="button"
                  className={`bet-chip ${active ? 'bet-chip-active' : ''}`}
                  onClick={() => onBetChange(suit)}
                >
                  <span>{meta.symbol}</span>
                  <strong>{meta.label}</strong>
                </button>
              )
            })}
          </div>
        </div>

        <label className="range-control">
          <span>구간 수</span>
          <div className="range-row">
            <input
              type="range"
              min={MIN_SEGMENTS}
              max={MAX_SEGMENTS}
              value={state.segmentCount}
              onChange={(event) => onSegmentChange(Number(event.target.value))}
            />
            <strong>{state.segmentCount}</strong>
          </div>
        </label>

        <div className="button-row">
          <button type="button" onClick={onStart} disabled={state.phase !== 'ready'}>
            게임 시작
          </button>
          <button type="button" onClick={onPlayTurn} disabled={!canPlay}>
            한 턴 진행
          </button>
          <button type="button" className={autoPlay ? 'button-active' : ''} onClick={onToggleAutoPlay} disabled={!canPlay}>
            {autoPlay ? '자동 정지' : '자동 진행'}
          </button>
          <button type="button" className="button-ghost" onClick={onReset}>
            다시 섞기
          </button>
        </div>

        {state.phase === 'finished' ? (
          <button type="button" className="button-primary" onClick={onNextRound}>
            다음 라운드
          </button>
        ) : null}

        <div className="speed-row">
          {[
            ['normal', '일반'],
            ['fast', '빠름'],
            ['instant', '즉시'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={speed === value ? 'button-active' : 'button-ghost'}
              onClick={() => onSpeedChange(value as SpeedMode)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="result-banner">
          {state.phase === 'finished' ? (
            state.winner ? (
              <strong>{renderWinner(state.winner)} 우승!</strong>
            ) : (
              <strong>덱이 모두 소진되어 승자 없이 종료되었습니다.</strong>
            )
          ) : (
            <strong>도착선에 먼저 닿는 말이 승리합니다.</strong>
          )}
          <span>
            체크포인트 카드는 각 구간을 모든 말이 지나야 공개됩니다.
          </span>
        </div>
      </div>
    </section>
  )
}

function renderWinner(winner: Suit): string {
  const meta = SUIT_META[winner]
  return `${meta.symbol} ${meta.label}`
}

export type { SpeedMode }
