import { CardFace } from './CardFace'
import { SUIT_META } from '../game/cards'
import { getLatestMessages } from '../game/reducer'
import type { GameState } from '../game/types'

type InfoPanelProps = {
  state: GameState
}

export function InfoPanel({ state }: InfoPanelProps) {
  const latestMessages = getLatestMessages(state)
  const leaderPosition = Math.max(...state.horses.map((horse) => horse.position))
  const leaders = state.horses.filter((horse) => horse.position === leaderPosition)

  return (
    <section className="info-panel">
      <div className="hero-card">
        <div>
          <p className="eyebrow">현재 드로우</p>
          <h2>{state.currentDraw ? '방금 공개된 카드' : '게임을 시작해 첫 카드를 공개하세요'}</h2>
        </div>
        <CardFace card={state.currentDraw} />
      </div>

      <div className="status-grid">
        <article className="status-card">
          <span className="eyebrow">턴</span>
          <strong>{state.turn}</strong>
        </article>
        <article className="status-card">
          <span className="eyebrow">남은 덱</span>
          <strong>{state.drawDeck.length}</strong>
        </article>
        <article className="status-card">
          <span className="eyebrow">선두</span>
          <strong>
            {leaders.map((horse) => `${SUIT_META[horse.suit].symbol} ${SUIT_META[horse.suit].label}`).join(', ')}
          </strong>
        </article>
        <article className="status-card">
          <span className="eyebrow">상태</span>
          <strong>{getPhaseLabel(state)}</strong>
        </article>
      </div>

      <div className="log-panel">
        <div className="panel-heading">
          <p className="eyebrow">최근 진행</p>
          <h3>관전 로그</h3>
        </div>
        <ul className="log-list">
          {latestMessages.length > 0 ? (
            latestMessages.map((message) => <li key={message}>{message}</li>)
          ) : (
            <li>아직 진행된 턴이 없습니다.</li>
          )}
        </ul>
      </div>
    </section>
  )
}

function getPhaseLabel(state: GameState): string {
  if (state.phase === 'ready') {
    return '대기'
  }

  if (state.phase === 'playing') {
    return '진행 중'
  }

  if (state.winner) {
    return `종료 · ${SUIT_META[state.winner].label} 우승`
  }

  return '종료 · 승자 없음'
}
