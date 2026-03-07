# lab-chukei-online — CLAUDE.md

## 概要

`log.chukei.online` — 横スクロール型の歩けるラボログサイト。
ポートフォリオではなく、フィールドノート的な場所。テイスト: weird / quiet / precise / slightly uncanny。

---

## スタック

| ツール | バージョン |
|---|---|
| Qwik City | ^1.7.3 |
| TypeScript | ^5.4.3 |
| UnoCSS | ^0.60.4 |
| Vite | ^5.2.11 |

**重要**: `package.json` に `"type": "module"` が必須（unocss/vite の ESM 要件）。

---

## コマンド

```bash
pnpm dev          # 開発サーバー (SSR mode)
pnpm build        # プロダクションビルド
pnpm preview      # ビルド後プレビュー
pnpm update-log   # activity-log.json を手動更新
```

---

## ファイル構成

```
src/
  routes/
    index.tsx          # 唯一のルート — <World> をレンダリング
    layout.tsx         # Qwik City レイアウト
  components/
    world/
      World.tsx        # メイン: state + RAF loop + レイアウト
      Outside.tsx      # 外の世界 (sign / window / door)
      Inside.tsx       # 内の部屋 (note / desk / terminal / board / archive / intercom)
      Avatar.tsx       # キャラクター (20×50px, CSS leg animation)
    panels/
      ZonePanel.tsx    # ゾーン接触時の下部パネル
    router-head.tsx    # <head> タグ管理
  content/
    zones.ts           # ゾーン定義 + ワールド定数
    site.ts            # 静的コピーテキスト (SITE オブジェクト)
  generated/
    activity-log.json  # 週次自動生成 (GitHub Actions でコミット)
  root.tsx
  entry.ssr.tsx
content/
  manual-log.json      # 手書きノート (スクリプトにマージされる)
scripts/
  update-activity-log.mjs  # GitHub Events API → activity-log.json
.github/workflows/
  weekly-log.yml       # 毎週月曜 02:00 UTC 自動実行
uno.config.ts          # カスタムショートカット + keyframe animation
vite.config.ts
```

---

## ワールド構造

```
x=0                x=750     x=1610  x=1674    x=2000                    x=5200
|---outdoor sky/ground--------|  door |wall-----|==== indoor room =========|
                  |-- building facade ----------|
                                                ^
                                            INSIDE_START
```

- **WORLD_WIDTH**: `5200px`
- **INSIDE_START**: `2000px` (この境界を越えると室内判定)
- **AVATAR_SPEED**: `3px/frame`
- **AVATAR_START_X**: `100`

### ゾーン一覧

| id | x | section | 対応コンポーネント内容 |
|---|---|---|---|
| sign | 380 | outside | 看板 (lab.chukei) |
| window | 1050 | outside | 窓 |
| door | 1680 | outside | 扉 (開閉アニメ) |
| note | 2350 | inside | 週次シグナルメモ |
| desk | 2920 | inside | 今やってること |
| terminal | 3440 | inside | 動いてるもの |
| board | 3980 | inside | オープンクエスチョン |
| archive | 4520 | inside | ケースファイル/残骸 |
| intercom | 5000 | inside | 連絡先 / SNS |

---

## World.tsx — state & ループ

```ts
useStore({
  avatarX: number       // 現在位置 (world px)
  scrollX: number       // viewport オフセット
  activeZone: string|null
  timeOfDay: 'morning'|'day'|'evening'|'night'
  isWalking: boolean
  isInside: boolean
  showHint: boolean
  doorFlash: number     // 0–1 opacity (暗転オーバーレイ)
  doorPhase: 'idle'|'in'|'hold'|'out'
  doorHoldFrames: number
})
```

### RAF ループの処理順

1. `wheelVel` 減衰 (×0.88/frame)
2. キーボード移動 (Arrow / WASD)
3. `scrollX` 更新 (avatar を viewport 中央に)
4. ゾーン検出: `Math.abs(zone.x - avatarX) <= zone.triggerRange`
5. `isInside` 判定 + **室内遷移ステートマシン** トリガー

### 室内遷移ステートマシン (doorPhase)

```
idle → in (+0.10/frame) → hold (22フレーム) → out (-0.028/frame) → idle
```

- `in`: 画面を黒くフェードイン
- `hold`: 完全黒画面で保持 (~0.37s)
- `out`: ゆっくりフェードアウト
- `x >= INSIDE_START` の閾値を越えた瞬間にトリガー (idle 時のみ)

---

## 外の扉 (Outside.tsx)

```
DOOR_LEFT  = 1610
DOOR_WIDTH = 64
DOOR_RIGHT = 1674
```

建物ファサードは3分割:
1. **LEFT** (x=750–1610): ドア左側の壁
2. **ABOVE_DOOR** (x=1610–1674, top:8% to bottom:calc(30%+112px)): ドア上部の壁
3. **RIGHT** (x=1674–2000): ドア右側の壁 (inside まで延伸)

**ドアパネル開閉**: `activeZone === 'door'` のとき `scaleX(0.04)`、`transformOrigin: 'left center'`

---

## 内の部屋 (Inside.tsx)

- 背景は `left: 2000px, width: 3200px`
- **入口扉** (x=2064–2128): やや開いた状態 (`scaleX(0.07)`)、静的装飾
- **終端壁** (x=5150): `lab-wall` クラス

---

## アバター (Avatar.tsx)

```
幅20px × 高50px
  head:  12×12 (circle, left:4px)
  body:  20×22 (top:13px)
  leg-l:  8×14 (top:36px, left:1px)
  leg-r:  8×14 (top:36px, left:11px)
```

- 室外: `#38342e` / 室内: `#504840`
- 歩行中: `.avatar-walking` クラスで CSS keyframe が発動

---

## UnoCSS ショートカット

| クラス | 用途 |
|---|---|
| `sky-morning/day/evening/night` | 外の空色 |
| `lab-wall` | 外壁 `#b8b0a4` |
| `lab-wall-inner` | 内壁 `#e4e0da` |
| `lab-floor-out` | 外地面 |
| `lab-floor-in` | 内床 |
| `lab-ceiling` | 天井 |
| `hotspot` | インタラクティブ要素 (cursor-pointer) |
| `zone-panel` | 下部パネル |
| `avatar-body` | アバター色 |
| `avatar-walking` | 歩行アニメ ON |

---

## 時刻 (Asia/Tokyo UTC+9)

```
05–10: morning  |  11–16: day  |  17–20: evening  |  21–04: night
```

SSR-safe: `useTask$` 内で `getTokyoHour()` を呼ぶ。

---

## activity-log.json

`scripts/update-activity-log.mjs` が生成。GitHub Events API + `content/manual-log.json` をマージ。

```json
{
  "generated": "ISO date",
  "weekSignal": "一文の週次サマリー",
  "now":       ["今触ってること", ...],
  "running":   ["動いてるプロジェクト", ...],
  "questions": ["オープンクエスチョン", ...],
  "residue":   ["壊れた/放置したもの", ...]
}
```

### GitHub Actions

- スケジュール: 毎週月曜 02:00 UTC
- Secret: `LOG_GITHUB_TOKEN` (PAT, repo:read)
- Vars: `LOG_GITHUB_USERNAME`, `LOG_ALLOWLIST_REPOS` (optional)

---

## よくある落とし穴

- **ESM エラー**: `"type": "module"` が package.json にないと unocss/vite が require で読まれて失敗する
- **`entry.ssr.tsx`**: `manifest` を named import しない (Qwik 1.7.x では不要)
- **UnoCSS Theme**: `transitionDuration` は Theme 型にないので定義しない
- **配列 fontFamily**: UnoCSS theme の `fontFamily` はカンマ区切り文字列で指定 (配列不可)
- **ドア上部の空白**: Outside.tsx で `ABOVE_DOOR` ブロックを省くと夜空が透けて見える
- **x=1950–2000 の継ぎ目**: sky/ground の width を `2000px` にしないと隙間が黒く見える
