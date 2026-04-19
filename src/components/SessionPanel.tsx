import { SUIT_META } from '../game/cards'
import type { Suit } from '../game/types'

export type SessionRecord = {
  round: number
  bet: Suit | null
  winner: Suit | null
  payout: number
  turns: number
}

type SessionPanelProps = {
  bankroll: number
  roundsPlayed: number
  correctBets: number
  streak: number
  bestStreak: number
  history: SessionRecord[]
}

export function SessionPanel({
  bankroll,
  roundsPlayed,
  correctBets,
  streak,
  bestStreak,
  history,
}: SessionPanelProps) {
  return (
    <section className="session-panel">
      <div className="panel-heading">
        <p className="eyebrow">세션</p>
        <h3>오늘의 전적</h3>
      </div>

      <div className="session-summary-grid">
        <article className="session-card">
          <span className="eyebrow">보유 칩</span>
          <strong>{bankroll}</strong>
        </article>
        <article className="session-card">
          <span className="eyebrow">완료 라운드</span>
          <strong>{roundsPlayed}</strong>
        </article>
        <article className="session-card">
          <span className="eyebrow">적중</span>
          <strong>{correctBets}</strong>
        </article>
        <article className="session-card">
          <span className="eyebrow">최고 연승</span>
          <strong>{bestStreak}</strong>
        </article>
      </div>

      <div className="session-highlight">
        <strong>{streak > 0 ? `${streak}연속 적중 중` : '다음 라운드에서 흐름을 바꿔보세요'}</strong>
        <span>베팅은 라운드마다 100칩 고정, 적중 시 300칩, 실패 시 100칩 차감입니다.</span>
      </div>

      <div className="history-panel">
        <div className="panel-heading">
          <p className="eyebrow">최근 결과</p>
          <h3>라운드 히스토리</h3>
        </div>

        <ul className="history-list">
          {history.length > 0 ? (
            history.slice(0, 6).map((record) => (
              <li key={record.round} className="history-item">
                <div>
                  <strong>R{record.round}</strong>
                  <span>{formatBet(record.bet)}</span>
                </div>
                <div>
                  <strong>{formatWinner(record.winner)}</strong>
                  <span>{record.turns}턴</span>
                </div>
                <div className={record.payout >= 0 ? 'history-profit' : 'history-loss'}>
                  {record.payout >= 0 ? `+${record.payout}` : record.payout}
                </div>
              </li>
            ))
          ) : (
            <li className="history-item history-empty">아직 종료된 라운드가 없습니다.</li>
          )}
        </ul>
      </div>
    </section>
  )
}

function formatBet(suit: Suit | null): string {
  if (!suit) {
    return '베팅 없음'
  }

  const meta = SUIT_META[suit]
  return `베팅 ${meta.symbol} ${meta.label}`
}

function formatWinner(suit: Suit | null): string {
  if (!suit) {
    return '승자 없음'
  }

  const meta = SUIT_META[suit]
  return `${meta.symbol} ${meta.label}`
}
