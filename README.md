# デッドロック戦術資料室

Deadlockのヒーロー、アイテム、マップ、アップデートを日本語で確認できる非公式ファンサイトです。

## ページ

- `/` カテゴリ一覧
- `/map/` 最新ゲームデータに基づく地上・地下マップ。目標、キャンプ、ショップ、移動手段を切り替えて表示
- `/heroes/` ヒーロー検索、能力・ステータス、直近3日の勝率・採用率、人気ビルド、対面・味方相性
- `/items/` 武器・生命力・スピリットアイテムの検索
- `/updates/` アップデート情報とSteam公式ニュース

## データ

ヒーロー戦績、ビルド、相性、マップ配置は[Deadlock API](https://api.deadlock-api.com/docs)の公開データを使用します。統計は直近3日の通常モードを集計し、ページに取得時刻を表示します。公開試合数やデータ更新状況により数値は変わります。

## 開発・公開

静的ページとCloudflare Pages Functionsで構成しています。Steam公式ニュースは`functions/api/latest.js`、ヒーロー戦績は`functions/api/hero-insights.js`、マップデータは`functions/api/map-data.js`で取得します。

Cloudflare Pagesで公開しています。Deadlockおよびゲーム内画像はValveの資産であり、本サイトはValveと関係ありません。

