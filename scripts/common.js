// ============================================================
// common.js - 所有页面共通
// ============================================================

// ==================== 导航配置 ====================
const NAV_LINKS = [
    { href: 'index.html', icon: 'fa-home', label: 'ダッシュボード' },
    { href: 'tetsu.html', icon: 'fa-flag', label: '鉄律会' },
    { href: 'sakura.html', icon: 'fa-cherry-blossom', label: '桜蔭' },
    { href: 'schedule.html', icon: 'fa-calendar-alt', label: '年間予定' },
    { href: 'exam.html', icon: 'fa-pencil-alt', label: '試験' },
    { href: 'homework.html', icon: 'fa-book', label: '宿題' }
];

// ==================== 导航生成 ====================
function renderNavbar() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    let navHtml = `
        <nav class="navbar">
            <div class="nav-links">
                <span class="nav-icon"><i class="fas fa-compass"></i></span>
    `;
    
    NAV_LINKS.forEach(link => {
        const active = (link.href === currentPage) ? ' active' : '';
        navHtml += `
            <a href="${link.href}" class="${active}"><i class="fas ${link.icon}"></i> ${link.label}</a>
        `;
    });
    
    navHtml += `
            </div>
            <div class="nav-right">                
                <div class="data-actions" id="dataActions">
                    <span id="statusInfo">
                        <span class="status-dot offline" id="statusDot"></span>
                        <span id="statusText">オフライン</span>
                    </span>
                    <button onclick="saveToGitHub()" id="saveBtn" disabled><i class="fab fa-github"></i> 保存</button>
                    <button onclick="loadFromGitHub()" id="loadBtn" disabled><i class="fas fa-download"></i> 読込</button>
                </div>
            </div>
        </nav>
    `;
    
    const navContainer = document.getElementById('navbarContainer');
    if (navContainer) {
        navContainer.innerHTML = navHtml;
    }
    
    // データ操作用ボタンを追加（ページごとにカスタマイズ可能）
    renderDataActions();
}

// ==================== データ操作用ボタン ====================
function renderDataActions() {
    const container = document.getElementById('dataActions');
    if (!container) return;
    
    const showExport = window.SHOW_EXPORT !== undefined ? window.SHOW_EXPORT : true;
    const showImport = window.SHOW_IMPORT !== undefined ? window.SHOW_IMPORT : true;
    
    // 既存のボタンを保持
    const statusInfo = container.querySelector('#statusInfo');
    const saveBtn = container.querySelector('#saveBtn');
    const loadBtn = container.querySelector('#loadBtn');
    
    let html = '';
    if (statusInfo) html += statusInfo.outerHTML;
    if (saveBtn) html += saveBtn.outerHTML;
    if (loadBtn) html += loadBtn.outerHTML;
    
    if (showExport || showImport) {
        html += `<span style="margin-left:4px;">|</span>`;
        if (showExport) {
            html += `<button onclick="exportData()" title="データをエクスポート（JSONファイル）"><i class="fas fa-file-export"></i></button>`;
        }
        if (showImport) {
            html += `<button onclick="document.getElementById('fileInput').click()" title="データをインポート（JSONファイル）"><i class="fas fa-file-import"></i></button>`;
            // fileInput が既に存在する場合は追加しない
            if (!document.getElementById('fileInput')) {
                html += `<input type="file" id="fileInput" accept=".json" style="display:none;" onchange="importData(event)">`;
            }
        }
    }
    
    container.innerHTML = html;
}

// ==================== Token 栏生成 ====================
function renderTokenBar() {
    const tokenHtml = `
        <div class="token-bar">
            <span class="label"><i class="fab fa-github"></i> Token:</span>
            <input type="password" id="tokenInput" placeholder="ghp_xxxxxxxxxxxx を入力" autocomplete="off">
            <button class="btn-set" onclick="setTokenFromInput()">設定</button>
            <span class="token-status" id="tokenStatus">🔑 未設定</span>
            <span style="font-size:0.75rem; color:#8f735b; margin-left:auto;">
                <i class="fas fa-info-circle"></i> 入力後「設定」をタップ
            </span>
        </div>
    `;
    
    const tokenContainer = document.getElementById('tokenBarContainer');
    if (tokenContainer) {
        tokenContainer.innerHTML = tokenHtml;
    }
}

// ==================== Token 管理 ====================
function getToken() {
    return localStorage.getItem('github_token') || '';
}

function setTokenFromInput() {
    const input = document.getElementById('tokenInput');
    if (!input) return;
    const token = input.value.trim();
    if (!token) { showToast('❌ Token を入力してください'); return; }
    if (!token.startsWith('ghp_')) { showToast('❌ Token は ghp_ で始まる必要があります'); return; }
    localStorage.setItem('github_token', token);
    input.value = '';
    // ★ Token 設定後に状態を更新 ★
    updateStatus();
    showToast('✅ Token を設定しました');
}

function updateStatus() {
    const token = getToken();
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    const status = document.getElementById('tokenStatus');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    
    // ★ 要素が存在しない場合は何もしない ★
    if (!dot || !text || !status) {
        // 要素が存在しない場合は処理をスキップ（初回表示時など）
        return;
    }
    
    if (token) {
        dot.className = 'status-dot online';
        text.textContent = '';
        status.textContent = '✅ ' + token.substring(0, 8) + '...';
        if (saveBtn) saveBtn.disabled = false;
        if (loadBtn) loadBtn.disabled = false;
    } else {
        dot.className = 'status-dot offline';
        text.textContent = '';
        status.textContent = '🔑 未設定';
        if (saveBtn) saveBtn.disabled = true;
        if (loadBtn) loadBtn.disabled = true;
    }
}

// ==================== Toast ====================
function showToast(msg) {
    const el = document.getElementById('toast');
    if (!el) {
        const newToast = document.createElement('div');
        newToast.id = 'toast';
        newToast.className = 'toast-msg';
        document.body.appendChild(newToast);
        setTimeout(() => {
            const el2 = document.getElementById('toast');
            if (el2) {
                el2.textContent = msg;
                el2.classList.add('show');
                clearTimeout(el2._timer);
                el2._timer = setTimeout(() => el2.classList.remove('show'), 3000);
            }
        }, 100);
        return;
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 3000);
}

// ============================================================
// 📦 プロジェクト全データを一括エクスポート
// ============================================================

function exportAllData() {
  const allData = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    totalItems: 0,
    data: {}
  };
  
  let totalCount = 0;
  
  // 1. ダッシュボードデータ (study_*)
  const dashboardData = {};
  const studyKeys = ['years', 'scores', 'reviews', 'tetsu', 'schedules', 'exams'];
  studyKeys.forEach(key => {
    const val = localStorage.getItem('study_' + key);
    if (val) {
      try {
        dashboardData['study_' + key] = JSON.parse(val);
        if (Array.isArray(dashboardData['study_' + key])) {
          totalCount += dashboardData['study_' + key].length;
        }
      } catch(e) {}
    }
  });
  if (Object.keys(dashboardData).length > 0) {
    allData.data.dashboard = dashboardData;
  }
  
  // 2. 試験管理データ
  const examRaw = localStorage.getItem('exam_data');
  if (examRaw) {
    try {
      allData.data.exam = JSON.parse(examRaw);
      totalCount += Object.keys(allData.data.exam).length;
    } catch(e) {}
  }
  
  // 3. 宿題管理データ
  const homeworkRaw = localStorage.getItem('homework_data');
  if (homeworkRaw) {
    try {
      allData.data.homework = JSON.parse(homeworkRaw);
      totalCount += Object.keys(allData.data.homework).length;
    } catch(e) {}
  }
  
  // 4. 成績データ（試験管理の成績）
  const scoreRaw = localStorage.getItem('exam_scores');
  if (scoreRaw) {
    try {
      allData.data.examScores = JSON.parse(scoreRaw);
      if (Array.isArray(allData.data.examScores)) {
        totalCount += allData.data.examScores.length;
      }
    } catch(e) {}
  }
  
  // 5. 鉄律会データ
  const tetsuRaw = localStorage.getItem('tetsu_data');
  if (tetsuRaw) {
    try {
      allData.data.tetsu = JSON.parse(tetsuRaw);
      totalCount += Object.keys(allData.data.tetsu).length;
    } catch(e) {}
  }
  
  // 6. デフォルト設定
  const defaultRaw = localStorage.getItem('exam_defaults');
  if (defaultRaw) {
    try {
      allData.data.examDefaults = JSON.parse(defaultRaw);
    } catch(e) {}
  }
  
  allData.totalItems = totalCount;
  
  // JSONファイルとしてダウンロード
  const json = JSON.stringify(allData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `study_all_backup_${new Date().toISOString().slice(0,10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast(`📁 全データをエクスポートしました (${totalCount}件)`);
}

// グローバル公開
window.exportAllData = exportAllData;

// ==================== 初期化 ====================
document.addEventListener('DOMContentLoaded', function() {
    // 1. ナビゲーションを描画
    renderNavbar();
    
    // 2. Token 欄を描画
    renderTokenBar();
    
    // 3. 状態を更新（ここで初めて要素が存在する）
    updateStatus();
    
    // 4. Token 入力欄の Enter イベント
    const tokenInput = document.getElementById('tokenInput');
    if (tokenInput) {
        tokenInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                setTokenFromInput();
            }
        });
    }
});

// グローバル公開
window.getToken = getToken;
window.setTokenFromInput = setTokenFromInput;
window.updateStatus = updateStatus;
window.showToast = showToast;
