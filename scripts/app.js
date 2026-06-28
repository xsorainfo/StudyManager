// ===================== 配置 =====================
// GitHub 仓库信息 - 请修改为您的仓库
const GITHUB_OWNER = '您的GitHub用户名';
const GITHUB_REPO = '您的仓库名';
const GITHUB_PATH = 'data/data.json';
const GITHUB_BRANCH = 'main'; // 或 'master'

// ===================== Token 管理 =====================
function getToken() {
  return localStorage.getItem('github_token') || '';
}

function saveToken() {
  const token = document.getElementById('githubToken').value.trim();
  if (token) {
    localStorage.setItem('github_token', token);
    document.getElementById('tokenStatus').textContent = '✅ 設定済み';
    updateGitHubStatus();
  }
}

function loadToken() {
  const token = getToken();
  if (token) {
    document.getElementById('githubToken').value = token;
    document.getElementById('tokenStatus').textContent = '✅ 設定済み';
    updateGitHubStatus();
  }
}

function setupGitHub() {
  saveToken();
  showToast('🔑 Token を設定しました');
}

// ===================== GitHub API 通信 =====================
async function getGitHubHeaders() {
  const token = getToken();
  if (!token) {
    showToast('❌ GitHub Token が設定されていません');
    return null;
  }
  return {
    'Authorization': `token ${token}`,
    'Accept': 'application/vnd.github.v3+json'
  };
}

function updateGitHubStatus() {
  const token = getToken();
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  const saveBtn = document.getElementById('saveBtn');
  const loadBtn = document.getElementById('loadBtn');
  
  if (token) {
    dot.className = 'status-dot online';
    text.textContent = 'オンライン';
    saveBtn.disabled = false;
    loadBtn.disabled = false;
  } else {
    dot.className = 'status-dot offline';
    text.textContent = '未設定';
    saveBtn.disabled = true;
    loadBtn.disabled = true;
  }
}

async function getFileSHA() {
  const headers = await getGitHubHeaders();
  if (!headers) return null;
  
  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
    const response = await fetch(url, { headers });
    
    if (response.status === 404) {
      return null; // 文件不存在
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return data.sha;
  } catch(e) {
    if (e.message.includes('404')) return null;
    console.error('Get SHA error:', e);
    return null;
  }
}

async function saveToGitHub() {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  const saveBtn = document.getElementById('saveBtn');
  
  // 先保存本地
  saveData();
  
  try {
    dot.className = 'status-dot saving';
    text.textContent = '保存中...';
    saveBtn.disabled = true;
    
    const headers = await getGitHubHeaders();
    if (!headers) {
      throw new Error('Token が設定されていません');
    }
    
    // 获取当前文件的 SHA（用于更新）
    const sha = await getFileSHA();
    
    // 准备数据
    const content = JSON.stringify(data, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(content)));
    
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
    const body = {
      message: `📝 データ更新: ${new Date().toISOString()}`,
      content: encodedContent,
      branch: GITHUB_BRANCH
    };
    
    if (sha) {
      body.sha = sha;
    }
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    dot.className = 'status-dot online';
    text.textContent = 'オンライン';
    showToast('✅ GitHub に保存しました');
    
  } catch(e) {
    dot.className = 'status-dot offline';
    text.textContent = 'エラー';
    showToast('❌ GitHub 保存失敗: ' + e.message);
  } finally {
    saveBtn.disabled = false;
  }
}

async function loadFromGitHub() {
  const dot = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  const loadBtn = document.getElementById('loadBtn');
  
  try {
    dot.className = 'status-dot saving';
    text.textContent = '読込中...';
    loadBtn.disabled = true;
    
    const headers = await getGitHubHeaders();
    if (!headers) {
      throw new Error('Token が設定されていません');
    }
    
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
    const response = await fetch(url, { headers });
    
    if (response.status === 404) {
      showToast('📭 GitHub にデータファイルがありません');
      dot.className = 'status-dot online';
      text.textContent = 'オンライン';
      return;
    }
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const fileData = await response.json();
    const content = decodeURIComponent(escape(atob(fileData.content)));
    const serverData = JSON.parse(content);
    
    // 验证数据结构
    const keys = ['years','scores','reviews','tetsu','schedules','exams'];
    for (let key of keys) {
      if (!Array.isArray(serverData[key])) {
        throw new Error('データ形式が正しくありません');
      }
    }
    
    data = serverData;
    saveData();
    renderAll();
    
    dot.className = 'status-dot online';
    text.textContent = 'オンライン';
    showToast('✅ GitHub から読み込みました');
    
  } catch(e) {
    dot.className = 'status-dot offline';
    text.textContent = 'エラー';
    showToast('❌ GitHub 読込失敗: ' + e.message);
  } finally {
    loadBtn.disabled = false;
  }
}

// ===================== ローカルデータ管理 =====================
const DB = {
  get(key, defaultVal) {
    try { return JSON.parse(localStorage.getItem('study_'+key)) || defaultVal; }
    catch { return defaultVal; }
  },
  set(key, val) { localStorage.setItem('study_'+key, JSON.stringify(val)); }
};

const defaultData = {
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

let data = {};
let currentModal = { type: '', id: null };

// ===================== ローカルデータ管理 =====================
function loadData() {
  data = {
    years: DB.get('years', defaultData.years),
    scores: DB.get('scores', defaultData.scores),
    reviews: DB.get('reviews', defaultData.reviews),
    tetsu: DB.get('tetsu', defaultData.tetsu),
    schedules: DB.get('schedules', defaultData.schedules),
    exams: DB.get('exams', defaultData.exams)
  };
  for (let key of ['years','scores','reviews','tetsu','schedules','exams']) {
    if (!data[key] || data[key].length === 0) {
      data[key] = defaultData[key];
      DB.set(key, data[key]);
    }
  }
  updateDataSize();
  loadToken();
  updateGitHubStatus();
}

function saveData() {
  for (let key of ['years','scores','reviews','tetsu','schedules','exams']) {
    DB.set(key, data[key]);
  }
  document.getElementById('lastUpdate').textContent = new Date().toISOString().slice(0,10);
  updateDataSize();
  showToast('💾 ローカルに保存しました');
}

function updateDataSize() {
  const allData = JSON.stringify(data);
  const size = (new Blob([allData]).size / 1024).toFixed(1);
  document.getElementById('dataSize').textContent = size + 'KB';
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

// ===================== データインポート/エクスポート =====================
function exportData() {
  const allData = JSON.stringify
