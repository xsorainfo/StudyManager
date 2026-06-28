# StudyManage

StudyManager/
├── data/
│   └── data.json          ← 数据文件（重要！）
├── pages/
│   └── index.html         ← 主页面
├── scripts/
│   └── app.js             ← JavaScript
└── README.md              ← 可选保留

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


