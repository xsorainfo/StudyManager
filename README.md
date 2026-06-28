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
┌──────────────────────────────────────┐
│  Pages                                │
│                                       │
│  Source                               │
│  [Deploy from a branch ▼]            │
│                                       │
│  Branch                               │
│  [gh-pages ▼]  [/(root) ▼]          │
│                                       │
│  [Save]                               │
└──────────────────────────────────────┘
