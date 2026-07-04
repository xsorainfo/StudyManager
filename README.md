# 学び航路 · 中学六年学习管理系统

中学六年（中1〜高3）の学習管理を一括で行うWebアプリケーションです。ダッシュボード、鉄律会、試験管理、宿題管理など、学校生活に必要な機能を統合しています。

---

## 🚀 デモ

[https://xsorainfo.github.io/StudyManager/pages/index.html](https://xsorainfo.github.io/StudyManager/pages/index.html)

---

## 📁 ディレクトリ構造

```
StudyManager/
├── data/
│   ├── data.json               # ダッシュボードデータ
│   ├── exam_data.json          # 試験管理データ
│   └── homework_data.json      # 宿題データ
├── pages/
│   ├── index.html              # ダッシュボード
│   ├── tetsu.html              # 鉄律会
│   ├── exam.html               # 試験管理
│   ├── homework.html           # 宿題管理
│   ├── anki-historyG2-1.html   # 中2歴史暗記
│   ├── anki-chemistry.html     # 化学式暗記
│   └── anki-kyushu-all.html    # 九州地名学習（暗記・選択・入力）
├── scripts/
│   ├── common.js               # 共通ナビゲーション・Token管理
│   ├── app.js                  # ダッシュボード用スクリプト
│   └── tetsu-data.js           # 鉄律会データ
├── favicon.png                 # ファビコン
├── apple-touch-icon.png        # iOSホーム画面アイコン
└── README.md
```

---

## ✨ 主な機能

### 1. ダッシュボード (`index.html`)
- 学年別学習進捗（中1〜高3）
- 考前复习（ToDoリスト）
- 成績登録・管理
- 鉄律会進捗サマリー
- 直近試験範囲表示
- GitHubバックアップ（保存／読込／エクスポート／インポート）

### 2. 鉄律会 (`tetsu.html`)
- 学年別（中1〜高3）・科目別（数学／英語）カリキュラム
- 週別授業内容表示
- 総復習テスト／復習テスト／計算テスト 管理
- 得点・平均点・偏差値の記録
- 偏差値に基づく自動評価（🏆優秀 / ⭐良好 / ✅標準 / 📈要努力 / ⚠️要注意）

### 3. 試験管理 (`exam.html`)
- 学年・学期・テスト種別でフィルタリング
- **成績一覧**（科目・得点・总分・平均点・偏差・备注）
- **成績追加**（得点＋偏差値 / 偏差値のみ モード切替）
- **成績編集・削除**
- **自動評価バッジ**（偏差値・得点率・平均点差に基づく）
- **偏差値色分け**（8以上:赤 / 7未満:緑）
- **学年モード**（全学期の偏差値を一覧表示）
- 試験範囲管理（学科別）
- 練習リンク管理
- 定期試験時間割（折りたたみ式）
- 提出物チェックリスト

### 4. 宿題管理 (`homework.html`)
- 学年・学期別
- 学科別宿題管理
- タイトル＋内容（複数行対応）
- 完了チェックボックス（完了日自動記録）
- 進捗表示（完了数／総数・達成率）
- 練習リンク管理

### 5. 暗記ツール
- **中2歴史暗記** (`anki-historyG2-1.html`)：赤字部分をタップで表示/非表示
- **化学式暗記** (`anki-chemistry.html`)：分子式／名前を隠すモード
- **九州地名学習** (`anki-kyushu-all.html`)：暗記・選択問題・入力問題の3モード

---

## 🔧 セットアップ

### 1. GitHub Tokenの設定

本アプリはGitHub APIを使用してデータをバックアップします。以下の手順でTokenを取得し、設定してください。

#### Tokenの生成
1. GitHubにログイン
2. [Settings] → [Developer settings] → [Personal access tokens] → [Tokens (classic)]
3. [Generate new token (classic)] をクリック
4. **Note**: `study-app`
5. **Expiration**: `No expiration`
6. **Scopes**: `repo` にチェック（全ての子項目が自動選択されます）
7. [Generate token] をクリック
8. **生成されたTokenをコピー**（`ghp_xxxxxxxxxxxx`）

#### Tokenの設定（初回のみ）
1. アプリページを開く
2. 画面最上部のToken入力欄にTokenを貼り付け
3. 「設定」ボタンをクリック

> **注意**: Tokenは各ブラウザのローカルストレージに保存されます。他の端末で使用する場合は、再度設定するか、共有リンク（後述）を使用してください。

---

## 🗄️ データ保存

| データ種別 | 保存場所 | 説明 |
|-----------|---------|------|
| ダッシュボード | `data/data.json` | 成績・复习・鉄律会進捗など |
| 試験管理 | `data/exam_data.json` | 試験範囲・成績・時間割など |
| 宿題管理 | `data/homework_data.json` | 宿題一覧・進捗 |
| ローカルキャッシュ | ブラウザ localStorage | 各ページのデータをローカルにキャッシュ |

### データ同期
- **「保存」ボタン**: ローカルデータをGitHubにアップロード
- **「読込」ボタン**: GitHubからデータをダウンロードして復元
- **export**: JSONファイルとしてダウンロード（バックアップ用）
- **import**: JSONファイルからデータを復元

---

## 🔑 データ移行（端末間共有）

### 方法1: GitHub同期（推奨）
1. 各端末で同じGitHub Tokenを設定
2. データ更新後「保存」ボタンをクリック
3. 別端末で「読込」ボタンをクリック

### 方法2: JSONファイル移行
1. 元の端末で「export」ボタンをクリック
2. JSONファイルをダウンロード
3. 新しい端末で「import」ボタンをクリック
4. ファイルをアップロード

### 方法3: 共有リンク（Token付きURL）
Token設定後、ブラウザのアドレスバーをブックマークすると、TokenがURLに含まれた状態で共有できます。

---

## 📱 モバイル対応

- iOS / Android 対応のレスポンシブデザイン
- iPadホーム画面アイコン対応（`apple-touch-icon.png`）
- タッチ操作に最適化されたUI

---

## 🛠️ 使用技術

| 技術 | 用途 |
|------|------|
| HTML5 / CSS3 | フロントエンド |
| JavaScript (ES6+) | アプリケーションロジック |
| Font Awesome | アイコン |
| GitHub API | データバックアップ |
| localStorage | ローカルデータ保存 |
| GitHub Pages | ホスティング |

---

## 📝 開発者向け情報

### カスタマイズ

#### デフォルト設定の変更
各ページの先頭にある定数を編集することで、デフォルトの表示を変更できます。

**例：`exam.html`**
```javascript
const DEFAULT_GRADE = '2';      // 1:中1 〜 6:高3
const DEFAULT_SEMESTER = '1';   // 1:一学期 2:二学期 3:三学期
const DEFAULT_EXAM_TYPE = 'regular'; // middle / regular / final
```

#### 科目リストの変更
`ALL_SUBJECTS` 配列を編集します。

```javascript
const ALL_SUBJECTS = ['国語', '文法', '代数', '幾何', '英語', ...];
```

#### ナビゲーションリンクの変更
`scripts/common.js` の `NAV_LINKS` を編集します。

```javascript
const NAV_LINKS = [
    { href: 'index.html', icon: 'fa-home', label: 'ダッシュボード' },
    // 追加・編集・削除可能
];
```

### 暗記ツールのデータ追加

#### 化学式暗記 (`anki-chemistry.html`)
`CHEMISTRY_DATA` 配列にオブジェクトを追加します。

```javascript
{ formula: 'H<sub>2</sub>O', name: '水', category: '化合物' }
```

#### 九州地名学習 (`anki-kyushu-all.html`)
`DATA` 配列にオブジェクトを追加します。

```javascript
{ name: '地名', desc: '説明文', category: 'カテゴリ' }
```

---

## 🐛 トラブルシューティング

### Tokenが認識されない
1. Tokenが `ghp_` で始まることを確認
2. `repo` 権限が付与されているか確認
3. ページを再読み込み（`Ctrl+Shift+R`）してキャッシュをクリア

### データが更新されない
1. ブラウザのキャッシュをクリア
2. 強制リロード（`Ctrl+Shift+R`）
3. `common.js` の読み込みにクエリパラメータを追加

```html
<script src="../scripts/common.js?v=20260704"></script>
```

### iPadホーム画面アイコンが表示されない
1. `apple-touch-icon.png`（180x180px）がルートに配置されているか確認
2. 既存のホーム画面アイコンを削除してから再度追加
3. Safariでページを開き、リロードしてから「ホーム画面に追加」

---

## 📄 ライセンス

MIT License

---

## 🙏 謝辞

- [Font Awesome](https://fontawesome.com/) - アイコン
- [GitHub](https://github.com/) - ホスティング・API

---

## 📞 お問い合わせ

不具合や機能リクエストは、GitHub Issues までお願いします。
