// ===================== 配置 =====================
// 从 config.js 读取配置（由 GitHub Actions 注入）
const CONFIG = window.GITHUB_CONFIG || {
    owner: '',
    repo: '',
    tokenEncoded: '',
    path: 'data/data.json',
    branch: 'main'
};

const GITHUB_OWNER = CONFIG.owner;
const GITHUB_REPO = CONFIG.repo;
const GITHUB_PATH = CONFIG.path;
const GITHUB_BRANCH = CONFIG.branch;

// ===================== Token 管理 =====================
function decodeToken() {
    if (CONFIG.tokenEncoded && CONFIG.tokenEncoded !== '') {
        try {
            const decoded = atob(CONFIG.tokenEncoded);
            return decoded;
        } catch(e) {
            console.error('Failed to decode token:', e);
            return '';
        }
    }
    return '';
}

function getToken() {
    // 1. 从 encoded token 解码（部署时）
    const decoded = decodeToken();
    if (decoded && decoded.startsWith('ghp_')) {
        return decoded;
    }
    
    // 2. 用户手动输入的（本地开发）
    const manualToken = localStorage.getItem('github_token_manual');
    if (manualToken) return manualToken;
    
    // 3. URL 参数（分享用）
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
        try {
            const decoded = atob(tokenFromUrl);
            if (decoded.startsWith('ghp_') || decoded.startsWith('github_')) {
                return decoded;
            }
        } catch(e) {}
        return tokenFromUrl;
    }
    
    return '';
}

function saveToken(token) {
    localStorage.setItem('github_token_manual', token);
    showToast('✅ Token を保存しました');
    updateGitHubStatus();
}

function getTokenDisplay() {
    const token = getToken();
    if (!token) return '未設定';
    if (token.length > 8) {
        return token.substring(0, 4) + '••••' + token.substring(token.length - 4);
    }
    return '••••••••';
}

// ===================== GitHub API 通信 =====================
function getGitHubHeaders() {
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
    const tokenStatus = document.getElementById('tokenStatus');
    
    if (token) {
        dot.className = 'status-dot online';
        text.textContent = 'オンライン';
        saveBtn.disabled = false;
        loadBtn.disabled = false;
        tokenStatus.textContent = '✅ ' + getTokenDisplay();
    } else {
        dot.className = 'status-dot offline';
        text.textContent = 'オフライン';
        saveBtn.disabled = true;
        loadBtn.disabled = true;
        tokenStatus.textContent = '🔑 未設定';
    }
}

async function getFileSHA() {
    const headers = getGitHubHeaders();
    if (!headers) return null;
    
    try {
        const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
        const response = await fetch(url, { headers });
        
        if (response.status === 404) {
            return null;
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
        
        const headers = getGitHubHeaders();
        if (!headers) {
            throw new Error('Token が設定されていません');
        }
        
        const sha = await getFileSHA();
        
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
        
        const headers = getGitHubHeaders();
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
    const allData = JSON.stringify(data, null, 2);
    const blob = new Blob([allData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study_data_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('📁 JSONファイルをエクスポートしました');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const imported = JSON.parse(e.target.result);
            const keys = ['years','scores','reviews','tetsu','schedules','exams'];
            for (let key of keys) {
                if (!Array.isArray(imported[key])) {
                    showToast('❌ データ形式が正しくありません');
                    return;
                }
            }
            if (confirm('現在のデータをインポートデータで上書きしますか？')) {
                data = imported;
                saveData();
                renderAll();
                showToast('📁 JSONファイルをインポートしました');
            }
        } catch(err) {
            showToast('❌ ファイルの読み込みに失敗しました');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

// ===================== レンダリング =====================
function renderAll() {
    renderYears();
    renderScores();
    renderReviews();
    renderTetsu();
    renderSchedules();
    renderRecentExams();
    updateTotalProgress();
}

function renderYears() {
    const grid = document.getElementById('yearGrid');
    grid.innerHTML = data.years.map(y => `
        <div class="year-item">
            <div class="year-label">${y.name}</div>
            <div class="year-sub">${y.sub}</div>
            <div class="year-progress"><div class="bar" style="width:${y.progress}%"></div></div>
        </div>
    `).join('');
}

function renderScores() {
    const container = document.getElementById('scoreList');
    if (data.scores.length === 0) {
        container.innerHTML = '<p class="text-muted">まだ成績がありません</p>';
        return;
    }
    container.innerHTML = `
        <table class="score-table">
            <thead><tr><th>科目</th><th>得点</th><th>日付</th><th></th></tr></thead>
            <tbody>
                ${data.scores.map(s => `
                    <tr>
                        <td>${s.subject}</td>
                        <td><strong>${s.score}</strong> / 100</td>
                        <td>${s.date || '-'}</td>
                        <td><span class="delete-btn" onclick="deleteItem('scores','${s.id}')"><i class="fas fa-trash"></i></span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function renderReviews() {
    const container = document.getElementById('reviewList');
    if (data.reviews.length === 0) {
        container.innerHTML = '<p class="text-muted">复习项目がありません</p>';
        return;
    }
    container.innerHTML = `
        <div class="review-card">
            <ul style="list-style:none; padding-left:6px;">
                ${data.reviews.map(r => `
                    <li style="display:flex; gap:10px; padding:6px 0; align-items:center;">
                        <span style="cursor:pointer;" onclick="toggleReview('${r.id}')">
                            <i class="${r.done ? 'fas fa-check-circle' : 'far fa-circle'}" style="color:${r.done ? '#6a8f6a' : '#b7a086'};"></i>
                        </span>
                        <span style="${r.done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${r.title}</span>
                        <span class="delete-btn" onclick="deleteItem('reviews','${r.id}')" style="margin-left:auto;"><i class="fas fa-trash"></i></span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function renderTetsu() {
    const container = document.getElementById('tetsuList');
    if (data.tetsu.length === 0) {
        container.innerHTML = '<li class="text-muted">鉄律会項目がありません</li>';
        return;
    }
    container.innerHTML = data.tetsu.map(t => `
        <li>
            <div class="tetsu-item-left">
                <span class="icon"><i class="fas ${t.icon || 'fa-book'}"></i></span>
                <span class="tetsu-name">${t.name}</span>
            </div>
            <div class="tetsu-progress">
                <div class="progress-track"><div class="fill" style="width:${t.progress}%"></div></div>
                <span class="progress-label">${t.progress}%</span>
                <span class="delete-btn" onclick="deleteItem('tetsu','${t.id}')"><i class="fas fa-trash"></i></span>
            </div>
        </li>
    `).join('');
}

function renderSchedules() {
    const container = document.getElementById('scheduleList');
    if (data.schedules.length === 0) {
        container.innerHTML = '<p class="text-muted">進度項目がありません</p>';
        return;
    }
    container.innerHTML = data.schedules.map(s => `
        <div style="display:flex; gap:10px; padding:6px 0; align-items:center; border-bottom:1px solid #ede6dd;">
            <span style="cursor:pointer;" onclick="toggleSchedule('${s.id}')">
                <i class="${s.done ? 'fas fa-check-circle' : 'far fa-circle'}" style="color:${s.done ? '#6a8f6a' : '#b7a086'};"></i>
            </span>
            <span style="${s.done ? 'text-decoration:line-through; opacity:0.6;' : ''}">${s.text}</span>
            <span class="delete-btn" onclick="deleteItem('schedules','${s.id}')" style="margin-left:auto;"><i class="fas fa-trash"></i></span>
        </div>
    `).join('');
}

function renderRecentExams() {
    const container = document.getElementById('recentExams');
    if (data.exams.length === 0) {
        container.textContent = '試験範囲が設定されていません';
        return;
    }
    container.innerHTML = data.exams.slice(0,3).map(e => 
        `${e.name} (${e.range})`
    ).join(' · ');
}

function updateTotalProgress() {
    if (data.tetsu.length === 0) {
        document.getElementById('totalProgress').textContent = '0%';
        return;
    }
    const total = data.tetsu.reduce((sum, t) => sum + t.progress, 0);
    const avg = Math.round(total / data.tetsu.length);
    document.getElementById('totalProgress').textContent = avg + '%';
}

// ===================== 操作関数 =====================
function toggleReview(id) {
    const item = data.reviews.find(r => r.id === id);
    if (item) { item.done = !item.done; saveData(); renderReviews(); }
}

function toggleSchedule(id) {
    const item = data.schedules.find(s => s.id === id);
    if (item) { item.done = !item.done; saveData(); renderSchedules(); }
}

function deleteItem(collection, id) {
    if (!confirm('削除しますか？')) return;
    data[collection] = data[collection].filter(item => item.id !== id);
    saveData();
    renderAll();
}

// ===================== モーダル =====================
function openModal(type, itemId = null) {
    const overlay = document.getElementById('modalOverlay');
    const body = document.getElementById('modalBody');
    const title = document.getElementById('modalTitle');
    currentModal.type = type;
    currentModal.id = itemId;

    let html = '';
    const item = itemId ? data[type === 'score' ? 'scores' : type === 'review' ? 'reviews' : type === 'tetsu' ? 'tetsu' : type === 'schedule' ? 'schedules' : 'exams']?.find(i => i.id === itemId) : null;

    switch(type) {
        case 'score':
            title.innerHTML = '<i class="fas fa-plus-circle"></i> ' + (item ? '成績編集' : '成績追加');
            html = `
                <div class="field"><label>科目名</label><input id="f_subject" value="${item?.subject || ''}" placeholder="例: 中2 歴史"></div>
                <div class="field"><label>得点 (0-100)</label><input id="f_score" type="number" value="${item?.score || ''}" min="0" max="100"></div>
                <div class="field"><label>日付</label><input id="f_date" type="date" value="${item?.date || new Date().toISOString().slice(0,10)}"></div>
            `;
            break;
        case 'review':
            title.innerHTML = '<i class="fas fa-plus-circle"></i> ' + (item ? '复习編集' : '复习追加');
            html = `
                <div class="field"><label>复习項目</label><input id="f_title" value="${item?.title || ''}" placeholder="例: 歴史 暗記"></div>
                <div class="field"><label>完了</label><select id="f_done"><option value="true" ${item?.done ? 'selected' : ''}>完了</option><option value="false" ${!item?.done ? 'selected' : ''}>未完了</option></select></div>
            `;
            break;
        case 'tetsu':
            title.innerHTML = '<i class="fas fa-plus-circle"></i> ' + (item ? '鉄律会編集' : '鉄律会追加');
            html = `
                <div class="field"><label>科目名</label><input id="f_name" value="${item?.name || ''}" placeholder="例: 古文・漢文"></div>
                <div class="field"><label>進捗 (%)</label><input id="f_progress" type="number" value="${item?.progress || 0}" min="0" max="100"></div>
                <div class="field"><label>アイコン (FontAwesome)</label><input id="f_icon" value="${item?.icon || 'fa-book'}" placeholder="例: fa-scroll"></div>
            `;
            break;
        case 'schedule':
            title.innerHTML = '<i class="fas fa-plus-circle"></i> ' + (item ? '進度編集' : '進度追加');
            html = `
                <div class="field"><label>進度内容</label><input id="f_text" value="${item?.text || ''}" placeholder="例: 第1週: 漢文 訓読"></div>
                <div class="field"><label>完了</label><select id="f_done"><option value="true" ${item?.done ? 'selected' : ''}>完了</option><option value="false" ${!item?.done ? 'selected' : ''}>未完了</option></select></div>
            `;
            break;
        case 'exam':
            title.innerHTML = '<i class="fas fa-plus-circle"></i> ' + (item ? '試験範囲編集' : '試験範囲追加');
            html = `
                <div class="field"><label>試験名</label><input id="f_name" value="${item?.name || ''}" placeholder="例: 中2 歴史 期末"></div>
                <div class="field"><label>範囲</label><input id="f_range" value="${item?.range || ''}" placeholder="例: p.36-39"></div>
            `;
            break;
    }
    body.innerHTML = html;
    overlay.classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
}

function saveModal() {
    const type = currentModal.type;
    const id = currentModal.id;

    switch(type) {
        case 'score': {
            const subject = document.getElementById('f_subject').value.trim();
            const score = parseInt(document.getElementById('f_score').value);
            const date = document.getElementById('f_date').value;
            if (!subject || isNaN(score)) { showToast('科目と得点を入力してください'); return; }
            if (id) {
                const item = data.scores.find(s => s.id === id);
                if (item) { item.subject = subject; item.score = score; item.date = date; }
            } else {
                data.scores.push({ id: generateId(), subject, score, date });
            }
            break;
        }
        case 'review': {
            const title = document.getElementById('f_title').value.trim();
            const done = document.getElementById('f_done').value === 'true';
            if (!title) { showToast('項目を入力してください'); return; }
            if (id) {
                const item = data.reviews.find(r => r.id === id);
                if (item) { item.title = title; item.done = done; }
            } else {
                data.reviews.push({ id: generateId(), title, done });
            }
            break;
        }
        case 'tetsu': {
            const name = document.getElementById('f_name').value.trim();
            const progress = parseInt(document.getElementById('f_progress').value) || 0;
            const icon = document.getElementById('f_icon').value.trim() || 'fa-book';
            if (!name) { showToast('科目名を入力してください'); return; }
            if (id) {
                const item = data.tetsu.find(t => t.id === id);
                if (item) { item.name = name; item.progress = Math.min(100, Math.max(0, progress)); item.icon = icon; }
            } else {
                data.tetsu.push({ id: generateId(), name, progress: Math.min(100, Math.max(0, progress)), icon });
            }
            break;
        }
        case 'schedule': {
            const text = document.getElementById('f_text').value.trim();
            const done = document.getElementById('f_done').value === 'true';
            if (!text) { showToast('内容を入力してください'); return; }
            if (id) {
                const item = data.schedules.find(s => s.id === id);
                if (item) { item.text = text; item.done = done; }
            } else {
                data.schedules.push({ id: generateId(), text, done });
            }
            break;
        }
        case 'exam': {
            const name = document.getElementById('f_name').value.trim();
            const range = document.getElementById('f_range').value.trim();
            if (!name) { showToast('試験名を入力してください'); return; }
            if (id) {
                const item = data.exams.find(e => e.id === id);
                if (item) { item.name = name; item.range = range; }
            } else {
                data.exams.push({ id: generateId(), name, range });
            }
            break;
        }
    }

    saveData();
    closeModal();
    renderAll();
    showToast('保存しました');
}

// ===================== Toast =====================
function showToast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ===================== ナビゲーション =====================
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        const tab = this.dataset.tab;
        if (tab === 'scores') openModal('score');
        else if (tab === 'exams') openModal('exam');
        else if (tab === 'tetsu') openModal('tetsu');
        else showToast(this.textContent.trim() + ' を表示');
    });
});

document.getElementById('modalOverlay').addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// ===================== 初期化 =====================
// 检查 config.js 是否加载成功
if (CONFIG.token && CONFIG.token !== '') {
    console.log('✅ GitHub Config loaded successfully');
    console.log('📁 Owner:', CONFIG.owner);
    console.log('📁 Repo:', CONFIG.repo);
} else {
    console.warn('⚠️ GitHub Config not loaded. Token may need to be set manually.');
}

loadData();
renderAll();

// 检查Token状态
setTimeout(() => {
    const token = getToken();
    if (token) {
        showToast('🚀 学び航路 起動しました');
    } else {
        showToast('⚠️ Tokenが未設定です。GitHub Actionsでデプロイしてください');
    }
}, 1000);

console.log('学び航路 全機能有効');
