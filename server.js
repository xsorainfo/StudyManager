// server.js - 后端服务器
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// data 目录路径 (项目根目录下的 data)
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'data.json');

// 确保 data 目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 默认数据结构
const DEFAULT_DATA = {
  years: [
    { id:'y1', name:'中1', sub:'基礎', progress:45 },
    { id:'y2', name:'中2', sub:'発展', progress:72 },
    { id:'y3', name:'中3', sub:'応用', progress:30 },
    { id:'y4', name:'高1', sub:'標準', progress:10 },
    { id:'y5', name:'高2', sub:'演習', progress:5 },
    { id:'y6', name:'高3', sub:'総仕上げ', progress:0 }
  ],
  scores: [
    { id:'s1', subject:'中2 歴史', score:86, date:'2026-06-27' },
    { id:'s2', subject:'中2 数学', score:72, date:'2026-06-25' },
    { id:'s3', subject:'中2 国語', score:90, date:'2026-06-20' }
  ],
  reviews: [
    { id:'r1', title:'歴史: 元禄文化・赤穂事件 暗記', done:false },
    { id:'r2', title:'数学: 一次関数グラフ 演習問題', done:false },
    { id:'r3', title:'英語: 不定詞・動名詞 復習', done:true }
  ],
  tetsu: [
    { id:'t1', name:'古文・漢文', progress:68, icon:'fa-scroll' },
    { id:'t2', name:'数学 応用', progress:42, icon:'fa-calculator' },
    { id:'t3', name:'歴史・地理', progress:81, icon:'fa-globe-asia' },
    { id:'t4', name:'理科 物理', progress:25, icon:'fa-flask' }
  ],
  schedules: [
    { id:'s1', text:'第1週: 漢文 訓読 完了', done:true },
    { id:'s2', text:'第2週: 江戸時代 基礎 完了', done:true },
    { id:'s3', text:'第3週: 関数 演習中 (70%)', done:false },
    { id:'s4', text:'第4週: 化学 未着手', done:false }
  ],
  exams: [
    { id:'e1', name:'中2 歴史 期末', range:'p.36-39 (江戸時代)' },
    { id:'e2', name:'中2 国語 漢文', range:'『論語』『孟子』' },
    { id:'e3', name:'中2 数学 関数', range:'一次関数・連立方程式' }
  ]
};

// 读取数据
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      const keys = ['years', 'scores', 'reviews', 'tetsu', 'schedules', 'exams'];
      for (let key of keys) {
        if (!Array.isArray(data[key])) {
          console.warn(`Invalid data structure for ${key}, using default`);
          return JSON.parse(JSON.stringify(DEFAULT_DATA));
        }
      }
      return data;
    }
  } catch (e) {
    console.error('Read data error:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

// 写入数据
function writeData(data) {
  try {
    const json = JSON.stringify(data, null, 2);
    fs.writeFileSync(DATA_FILE, json, 'utf-8');
    return true;
  } catch (e) {
    console.error('Write data error:', e);
    return false;
  }
}

// ===================== API 路由 =====================

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    dataFile: DATA_FILE
  });
});

// 保存数据
app.post('/api/save', (req, res) => {
  try {
    const data = req.body;
    const keys = ['years', 'scores', 'reviews', 'tetsu', 'schedules', 'exams'];
    for (let key of keys) {
      if (!Array.isArray(data[key])) {
        return res.status(400).json({ 
          error: `Invalid data: ${key} must be an array` 
        });
      }
    }
    
    if (writeData(data)) {
      res.json({ 
        success: true, 
        file: DATA_FILE,
        message: 'Data saved successfully'
      });
    } else {
      res.status(500).json({ error: 'Failed to write data' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 加载数据
app.get('/api/load', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ===================== 启动服务器 =====================
app.listen(PORT, () => {
  console.log(`✅ サーバー起動: http://localhost:${PORT}`);
  console.log(`📁 データ保存先: ${DATA_FILE}`);
  
  if (!fs.existsSync(DATA_FILE)) {
    writeData(DEFAULT_DATA);
    console.log('📝 デフォルトデータを作成しました');
  }
});
