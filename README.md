# StudyManage

your-repo/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 工作流
├── data/
│   └── data.json               # 数据文件
├── pages/
│   └── index.html              # 主页面
├── scripts/
│   ├── config.js               # 由 Actions 自动生成（不要手动编辑）
│   └── app.js                  # 主要逻辑
└── README.md

数据流向
text

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  操作 → localStorage (浏览器) ──「保存」──→ GitHub         │
│                              ──「読込」──← GitHub         │
│                              ──「バックアップ」→ 本地文件   │
│                              ──「復元」←─ 本地文件         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
