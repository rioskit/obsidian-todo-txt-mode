# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このプロジェクトはObsidianのプラグインで、Todo.txt形式をサポートします。Todo.txtはプレーンテキストでタスク管理を行うためのシンプルな形式です。

### 主な機能
- 完了タスク（`x `で始まる行）のハイライト表示と取り消し線
- プロジェクトタグ（`+project`）のハイライト
- コンテキストタグ（`@context`）のハイライト
- 優先度（`(A)`、`(B)`、`(123)`）のハイライト
- 期日（`due:yyyy-mm-dd`）のハイライト
- 完了タスクを専用ファイルに移動するコマンド
- タスクを様々な条件（優先度、プロジェクト、コンテキスト、期日）でソートするコマンド
- 繰り返しタスクの自動生成（`rec:d`、`rec:w`、`rec:m`、`rec:y`）

## 開発コマンド

```bash
# 開発モード（自動ビルド＆ホットリロード）
npm run dev

# 型チェック（コンパイルエラーを確認）
npx tsc -noEmit -skipLibCheck

# プロダクションビルド
npm run build

# テスト実行
npm test

# テスト監視モード
npm run test:watch

# テストカバレッジ
npm run test:coverage

# Lint実行
npm run lint

# Lint自動修正
npm run lint:fix

# バージョン番号の更新（manifest.jsonとversions.jsonを更新）
npm run version

# 全体的なチェック（lint、型チェック、テストを一括実行）
npm run check
```

## アーキテクチャ

このプラグインは以下のコンポーネントで構成されています：

1. **メインプラグインクラス（TodoTxtPlugin）**: 
   - Obsidianプラグインのライフサイクル管理
   - 設定の読み込みと保存
   - コマンドの登録
   - エディタ拡張の登録

2. **構文ハイライト（syntax.ts）**:
   - ViewPluginを使用した装飾の適用
   - 完了タスク、プロジェクト、コンテキストの構文ハイライト
   - 優先度と期日のハイライト

3. **設定管理（settings.ts）**:
   - TodoTxtSettingTabクラスで設定UIを提供
   - 複数のtodoファイルパスの管理
   - ハイライト設定（有効/無効、色）
   - ソート設定とバウンダリマーカー設定

4. **タスクソート機能（sort.ts）**:
   - 優先度、プロジェクト、コンテキスト、期日によるソート

5. **タスク移動機能（movetasks.ts）**:
   - 完了タスク（`x `で始まる行）を抽出
   - 元ファイルから削除
   - 完了タスク専用ファイルに追加

6. **タスク監視機能（task-watcher.ts）**:
   - ファイル変更の監視
   - リアルタイムタスク更新

7. **Todo.txtコアライブラリ（utils/todotxt-core/）**:
   - parser.ts: Todo.txt形式のパーサー機能
   - sorter.ts: タスクソート機能
   - recurrence.ts: 繰り返しタスクの処理
   - interfaces.ts: 型定義

## ファイル構造

```
src/
├── main.ts              # プラグインのメインコード、ライフサイクル管理
├── syntax.ts            # 構文ハイライト関連の機能（CodeMirror ViewPlugin）
├── settings.ts          # 設定関連のインターフェースと設定タブUI
├── sort.ts              # タスクソート機能
├── movetasks.ts         # タスク移動機能
├── task-watcher.ts      # タスク監視機能
├── utils/
│   └── todotxt-core/    # Todo.txtコアライブラリ
│       ├── parser.ts    # Todo.txt形式のパーサー機能
│       ├── sorter.ts    # タスクソート機能
│       ├── recurrence.ts # 繰り返しタスクの処理
│       ├── interfaces.ts # 型定義
│       ├── index.ts     # エクスポート
│       └── __tests__/   # コアライブラリのテスト
└── __tests__/           # テストファイル
    ├── recurrence.test.ts    # 繰り返し機能のテスト
    ├── syntax.test.ts        # 構文ハイライトのテスト
    └── task-watcher.test.ts  # タスク監視機能のテスト

# 設定ファイル
├── manifest.json        # プラグイン情報
├── package.json         # 依存関係と開発スクリプト
├── esbuild.config.mjs   # ビルド設定
├── jest.config.js       # Jestテスト設定
├── tsconfig.json        # TypeScript設定
├── tsconfig.test.json   # テスト用TypeScript設定
├── versions.json        # プラグインバージョンと最小Obsidianバージョンの情報
└── styles.css           # ハイライト表示用のCSS
```

## 重要な実装の詳細

### Todo.txtファイルの識別
プラグインは設定で指定された複数のファイルパスをtodo.txtファイルとして認識します。

### 構文ハイライト
CodeMirror ViewPluginを使用して、完了タスク、プロジェクト、コンテキスト、優先度、期日にリアルタイムでハイライトを適用します。

### タスク移動
完了タスク（`x `で始まる行）を複数のtodoファイルから抽出し、それらを指定された完了タスクファイルの先頭に追加します。

### タスクソート
タスクを優先度、プロジェクト、コンテキスト、期日の順でソートできます。境界線マーカー以下の行はソートされません。

## テスト方法

Obsidianの開発者モードでプラグインをテストするには：

1. このプラグインフォルダを`.obsidian/plugins/`にコピー
2. Obsidianを再起動
3. 設定から「Todo.txt Mode」プラグインを有効化
4. `.md`ファイルを作成し、設定でTodo.txtファイルとして指定
5. ファイルにTodo.txt形式のタスクを記述（例：`x 2023-05-08 完了したタスク +プロジェクト @コンテキスト`）
6. 優先度（例：`(A) 優先度の高いタスク`）や期日（例：`due:2023-05-15`）を試してみる

## 重要な開発注意事項

### テスト実行について
- 新機能やバグ修正の際は必ずテストを実行: `npm test`
- テストカバレッジを確認: `npm run test:coverage`
- テストファイルは `src/__tests__/` に配置

### ビルドプロセス
- TypeScriptの型チェックを必ず実行: `npx tsc -noEmit -skipLibCheck`
- Lintチェックを実行: `npm run lint`
- プロダクションビルド前に開発ビルドで動作確認: `npm run dev`

## プロジェクト特有の重要事項

### Todo.txtコアライブラリの活用
- `utils/todotxt-core/` 内のライブラリを使用してTodo.txt形式の処理を行う
- パーサー、ソーター、繰り返し処理は既に実装済み
- 新機能追加時はコアライブラリの拡張を検討する

### テストカバレッジの維持
- 新機能には必ずテストを追加
- コアライブラリの変更時は`utils/todotxt-core/__tests__/`のテストも更新
- 繰り返しタスク機能のテストは特に重要

### Obsidian API の適切な使用
- DOM操作は`innerHTML`を避け、Obsidianヘルパー関数を使用
- ファイル操作は`this.app.vault.cachedRead`を使用
- イベントリスナーは`this.registerDomEvent`で登録
- 設定管理は`loadData`/`saveData`を使用

## 開発前チェックリスト
1. **統合チェック**: `npm run check` でLint、型チェック、テストを一括実行
2. **個別チェック** (必要に応じて):
   - **テスト実行**: `npm test` でテストがパスすることを確認
   - **型チェック**: `npx tsc -noEmit -skipLibCheck` でTypeScriptエラーがないことを確認
   - **Lint確認**: `npm run lint` でコード品質を確認
3. **ビルド確認**: `npm run build` でビルドが成功することを確認
4. **余計なコメント不要**: コードを読んで理解できない特別な意味を持つ箇所以外はコメント不要

## 重要なテスト対象機能
- **繰り返しタスク機能**: `rec:d`、`rec:w`、`rec:m`、`rec:y`形式の処理
- **構文ハイライト**: CodeMirror ViewPluginの装飾適用
- **タスク監視**: ファイル変更の検知と処理