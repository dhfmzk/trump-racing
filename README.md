# Trump Racing

왈도쿤 방송 컨텐츠로 알려진 트럼프 경마를 웹에서 플레이할 수 있도록 만든 브라우저 게임입니다.

트럼프 카드의 네 무늬를 각각 하나의 말로 두고, 카드를 한 장씩 공개하면서 레이스를 진행합니다. 단순히 전진만 하는 게임이 아니라, 체크포인트에 숨겨진 카드가 뒤늦게 공개되면서 특정 말이 후진하기도 해서 흐름이 계속 뒤집히는 것이 핵심입니다.

배포 주소:
[https://dhfmzk.github.io/trump-racing/](https://dhfmzk.github.io/trump-racing/)

## Features

- 스페이드, 하트, 다이아, 클로버 4개 말로 진행되는 카드 레이스
- 체크포인트 공개에 따른 후진 페널티
- 한 턴 진행과 자동 진행 지원
- 전진과 후진을 나눠 보여주는 단계형 진행
- 중계 톤의 로그 토스트
- 모바일 화면과 Safe Area 대응 UI

## Rules

1. 네 말은 각각 카드 무늬 하나와 연결됩니다.
2. 게임 시작 전에 체크포인트마다 카드를 한 장씩 미리 배치합니다.
3. 진행 덱에서 카드를 한 장 공개하면, 같은 무늬의 말이 한 칸 전진합니다.
4. 모든 말이 특정 체크포인트를 지나가면 그 칸의 숨겨진 카드가 공개됩니다.
5. 공개된 카드와 같은 무늬의 말은 한 칸 후진합니다.
6. 가장 먼저 도착선을 통과한 말이 우승합니다.

## Controls

- `경기 시작`: 첫 턴을 바로 시작합니다.
- `다음 턴`: 카드를 한 장 공개하고 레이스를 한 단계 진행합니다.
- `체크포인트 공개`: 후진 판정이 남아 있을 때 다음 공개 단계를 진행합니다.
- `자동 진행`: 바텀 시트 안에서 전체 흐름을 자동으로 재생합니다.
- `구간 수`: 체크포인트 개수를 조절해 경기 길이를 바꿀 수 있습니다.

## Tech Stack

- React
- TypeScript
- Vite

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Deployment

GitHub Pages 배포는 GitHub Actions로 구성되어 있습니다.

1. `main` 브랜치에 푸시합니다.
2. 저장소의 `Settings > Pages`에서 Source를 `GitHub Actions`로 설정합니다.
3. 이후부터는 `main`에 푸시할 때마다 자동으로 배포됩니다.

워크플로 파일:
[.github/workflows/deploy-pages.yml](/Users/dhfmzk/Documents/SideProject/trump-racing/.github/workflows/deploy-pages.yml:1)

## Current Scope

현재는 플레이 가능한 첫 버전을 목표로 한 MVP 단계입니다.

- 핵심 레이스 룰 구현
- 현대적인 게임형 UI 정리
- 세로형 보드와 바텀 시트 레이아웃
- 실황 느낌의 로그 문구와 공개 페이즈 분리

## Roadmap

- 카드 공개와 말 이동 애니메이션 강화
- 사운드와 연출 추가
- 방송 룰 기반의 확장 모드 검토
- 스크린샷, GIF, 세부 규칙 문서 보강
