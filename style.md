# Style Settings 問題調査結果

## 問題
macOSでは表示されるStyle Settingsの設定が、iOS、Windows、Androidで表示されない。

## 原因分析

### 1. Style Settings統合方法の問題
- 現在の実装：styles.css内に`@settings`コメントブロックを配置
- 問題点：この方法はStyle Settingsプラグインの正式な統合方法ではない
- Style Settingsは通常、以下のいずれかの方法で統合される：
  - テーマの場合：theme.css内の`@settings`ブロック
  - プラグインの場合：CSS変数の動的設定またはstyle-settings.yamlファイル

### 2. モバイルプラットフォームでの制限
- モバイル版Obsidianでは、CSS内の`@settings`コメントブロックの解析が制限される可能性
- Style Settingsプラグインがモバイルでプラグインのstyles.cssを正しく読み込めない

### 3. 現在の実装の不整合
- settings.ts：色設定の保存機能はあるが、UIで色選択ができない（トグルのみ）
- CSS変数の適用：保存された色設定をCSS変数として適用するコードが存在しない
- styles.css：CSS変数を参照しているが、これらの変数が設定されていない

## 解決策

### 方法1：CSS変数の動的設定（推奨）
```typescript
// main.tsに追加
updateCSSVariables() {
    const root = document.documentElement;
    root.style.setProperty('--todo-txt-mode-project-color', this.settings.projectColor);
    root.style.setProperty('--todo-txt-mode-context-color', this.settings.contextColor);
    // 他の色設定も同様に...
}
```

### 方法2：Style Settings依存の削除
- 独自の色選択UIを実装
- settings.tsに色選択用のカラーピッカーを追加
- すべてのプラットフォームで一貫した動作を保証

## 影響範囲
- Mac：現状でも動作しているが、実際には色のカスタマイズはできない
- iOS/Windows/Android：Style Settings統合が表示されない
- 全プラットフォーム：色のカスタマイズ機能が実質的に使用できない

## 推奨アクション
1. styles.cssから`@settings`ブロックを削除
2. main.tsでCSS変数を動的に設定
3. settings.tsに色選択UIを追加
4. 全プラットフォームでテスト