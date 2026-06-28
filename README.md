# StudyManage

中学六年学习管理系统

---

## 📁 目录结构
StudyManager/
├── data/
│ └── data.json # 数据文件
├── pages/
│ └── index.html # 主页面
├── scripts/
│ └── app.js # 主要逻辑
└── README.md # 说明文档

---

## 🔄 数据流向
┌─────────────────────────────────────────────────────────────┐
│ │
│ 操作 → localStorage (浏览器) ──「保存」──→ GitHub │
│ ──「読込」──← GitHub │
│ ──「バックアップ」→ 本地文件 │
│ ──「復元」←─ 本地文件 │
│ │
└─────────────────────────────────────────────────────────────┘

---

## 🚀 使用说明

### 1. 首次使用

1. 访问：`https://xsorainfo.github.io/StudyManager/pages/index.html`
2. 在页面顶部输入 GitHub Token（`ghp_xxxx...`）
3. 点击「設定」

### 2. 日常使用

| 操作 | 说明 |
|------|------|
| 添加/修改数据 | 自动保存到浏览器 localStorage |
| 「保存」 | 保存到 GitHub 的 `data/data.json` |
| 「読込」 | 从 GitHub 读取数据 |
| 「バックアップ」 | 导出 JSON 文件到本地 |
| 「復元」 | 从 JSON 文件恢复数据 |

---

## 🔑 GitHub Token 设置

1. 访问：https://github.com/settings/tokens
2. Generate new token (classic)
3. 勾选 `repo` 权限
4. 复制 Token
5. 在页面顶部输入并点击「設定」

---

## 📊 功能模块

- 学年学習大纲（中学6年）
- 成績登録・管理
- 考前复习
- 鉄律会 学習大纲・進度
- 試験範囲管理

---

## 📝 数据备份建议

- 定期点击「バックアップ」保存 JSON 文件到本地
- 换设备时点击「復元」恢复数据
- 重要修改前先备份

---

## ⚠️ 注意事项

- 数据同时保存在浏览器和 GitHub
- 换设备时从 GitHub「読込」即可同步
- Token 只在当前浏览器保存，换设备需重新输入
