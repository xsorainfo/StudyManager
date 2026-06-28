// ==================== 配置 ====================
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

// ==================== Token 管理 ====================
function getToken() {
    // 1. 从 config.js 解码（Actions 自动注入）
    if (CONFIG.tokenEncoded && CONFIG.tokenEncoded !== '') {
        try {
            const decoded = atob(CONFIG.tokenEncoded);
            if (decoded && decoded.startsWith('ghp_')) {
                console.log('✅ Token decoded from config.js');
                return decoded;
            }
        } catch(e) {
            console.error('Decode error:', e);
        }
    }
    
    // 2. 用户手动输入（本地开发）
    const manualToken = localStorage.getItem('github_token_manual');
    if (manualToken && manualToken.startsWith('ghp_')) {
        console.log('✅ Token from localStorage');
        return manualToken;
    }
    
    console.log('❌ No token found');
    return '';
}

function getGitHubHeaders() {
    const token = getToken();
    if (!token) {
        console.error('❌ Token is empty');
        return null;
    }
    return {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
    };
}

// ==================== 保存数据 ====================
async function saveToGitHub() {
    const token = getToken();
    if (!token) {
        alert('❌ Token が設定されていません');
        return;
    }
    
    const data = {
        years: JSON.parse(localStorage.getItem('study_years') || '[]'),
        scores: JSON.parse(localStorage.getItem('study_scores') || '[]'),
        reviews: JSON.parse(localStorage.getItem('study_reviews') || '[]'),
        tetsu: JSON.parse(localStorage.getItem('study_tetsu') || '[]'),
        schedules: JSON.parse(localStorage.getItem('study_schedules') || '[]'),
        exams: JSON.parse(localStorage.getItem('study_exams') || '[]')
    };
    
    console.log('💾 Saving to main branch:', Object.keys(data));
    
    try {
        const content = JSON.stringify(data, null, 2);
        const encoded = btoa(unescape(encodeURIComponent(content)));
        const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
        const headers = getGitHubHeaders();
        
        // 检查文件是否存在
        let sha = null;
        const checkRes = await fetch(url, { headers });
        if (checkRes.ok) {
            const fileData = await checkRes.json();
            sha = fileData.sha;
            console.log('📝 文件存在，SHA:', sha);
        } else {
            console.log('📝 文件不存在，将创建');
        }
        
        const body = {
            message: `📝 データ更新: ${new Date().toISOString()}`,
            content: encoded,
            branch: GITHUB_BRANCH
        };
        if (sha) body.sha = sha;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: headers,
            body: JSON.stringify(body)
        });
        
        if (response.ok) {
            console.log('✅ 保存成功！');
            alert('✅ データを保存しました！');
        } else {
            const err = await response.json();
            throw new Error(err.message || `HTTP ${response.status}`);
        }
    } catch(e) {
        console.error('❌ 保存失败:', e);
        alert('❌ 保存失敗: ' + e.message);
    }
}

// ==================== 读取数据 ====================
async function loadFromGitHub() {
    const token = getToken();
    if (!token) {
        alert('❌ Token が設定されていません');
        return;
    }
    
    console.log('📥 Loading from main branch...');
    
    try {
        const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;
        const headers = getGitHubHeaders();
        
        const response = await fetch(url, { headers });
        
        if (response.status === 404) {
            alert('📭 データファイルがありません');
            return;
        }
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const fileData = await response.json();
        const content = decodeURIComponent(escape(atob(fileData.content)));
        const loadedData = JSON.parse(content);
        
        Object.keys(loadedData).forEach(key => {
            localStorage.setItem('study_' + key, JSON.stringify(loadedData[key]));
        });
        
        console.log('✅ 読み込み成功！');
        alert('✅ データを読み込みました');
        location.reload();
        
    } catch(e) {
        console.error('❌ 読み込み失敗:', e);
        alert('❌ 読み込み失敗: ' + e.message);
    }
}

// ==================== 状态更新 ====================
function updateStatus() {
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
        tokenStatus.textContent = '✅ 設定済み';
    } else {
        dot.className = 'status-dot offline';
        text.textContent = 'オフライン';
        saveBtn.disabled = true;
        loadBtn.disabled = true;
        tokenStatus.textContent = '🔑 未設定';
    }
}

// ==================== 初始化 ====================
console.log('📌 GITHUB_OWNER:', GITHUB_OWNER);
console.log('📌 GITHUB_REPO:', GITHUB_REPO);
console.log('📌 GITHUB_BRANCH:', GITHUB_BRANCH);

// 从 config.js 加载 Token
if (CONFIG.tokenEncoded && CONFIG.tokenEncoded !== '') {
    console.log('✅ Config loaded from main branch');
}

updateStatus();
