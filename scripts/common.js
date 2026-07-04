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
    updateStatus();
}

// ==================== データ操作用ボタン ====================
function renderDataActions() {
    const container = document.getElementById('dataActions');
    if (!container) return;
    
    const showExport = window.SHOW_EXPORT !== undefined ? window.SHOW_EXPORT : true;
    const showImport = window.SHOW_IMPORT !== undefined ? window.SHOW_IMPORT : true;
    
    // ★ 現在のページが index.html かどうか判定 ★
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const isHomePage = (currentPage === 'index.html');
    
    // statusInfo と save/load ボタンを保持
    const statusInfo = container.querySelector('#statusInfo');
    const saveBtn = container.querySelector('#saveBtn');
    const loadBtn = container.querySelector('#loadBtn');
    
    let html = '';
    if (statusInfo) html += statusInfo.outerHTML;
    if (saveBtn) html += saveBtn.outerHTML;
    if (loadBtn) html += loadBtn.outerHTML;
    
    // ★ ホームページのみ一括エクスポートボタン ★
    if (isHomePage) {
        html += `
            <button onclick="exportAllData()" title="全データをZIPで一括エクスポート" style="background:#5f4b38; color:#fff; border:none; padding:6px 14px; border-radius:40px; cursor:pointer; font-size:0.8rem; display:flex; align-items:center; gap:5px;">
                <i class="fas fa-file-archive"></i> 一括出力
            </button>
        `;
    }
    
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

// ============================================================
// 📦 プロジェクト全データをZIPで一括エクスポート
// ============================================================

function exportAllData() {
  // JSZipが読み込まれているかチェック
  if (typeof JSZip === 'undefined') {
    showToast('❌ JSZipライブラリが読み込まれていません');
    return;
  }
  
  const zip = new JSZip();
  const dateStr = new Date().toISOString().slice(0,10);
  let fileCount = 0;
  
  // 1. ダッシュボードデータ (study_*)
  const dashboardData = {};
  const studyKeys = ['years', 'scores', 'reviews', 'tetsu', 'schedules', 'exams'];
  studyKeys.forEach(key => {
    const val = localStorage.getItem('study_' + key);
    if (val) {
      try {
        dashboardData['study_' + key] = JSON.parse(val);
      } catch(e) {}
    }
  });
  if (Object.keys(dashboardData).length > 0) {
    zip.file(`dashboard_backup_${dateStr}.json`, JSON.stringify(dashboardData, null, 2));
    fileCount++;
  }
  
  // 2. 試験管理データ
  const examRaw = localStorage.getItem('exam_data');
  if (examRaw) {
    try {
      zip.file(`exam_data_${dateStr}.json`, JSON.stringify(JSON.parse(examRaw), null, 2));
      fileCount++;
    } catch(e) {}
  }
  
  // 3. 成績データ
  const scoreRaw = localStorage.getItem('exam_scores');
  if (scoreRaw) {
    try {
      zip.file(`exam_scores_${dateStr}.json`, JSON.stringify(JSON.parse(scoreRaw), null, 2));
      fileCount++;
    } catch(e) {}
  }
  
  // 4. 宿題管理データ
  const homeworkRaw = localStorage.getItem('homework_data');
  if (homeworkRaw) {
    try {
      zip.file(`homework_data_${dateStr}.json`, JSON.stringify(JSON.parse(homeworkRaw), null, 2));
      fileCount++;
    } catch(e) {}
  }
  
  // 5. 鉄律会データ
  const tetsuRaw = localStorage.getItem('tetsu_data');
  if (tetsuRaw) {
    try {
      zip.file(`tetsu_data_${dateStr}.json`, JSON.stringify(JSON.parse(tetsuRaw), null, 2));
      fileCount++;
    } catch(e) {}
  }
  
  // 6. デフォルト設定
  const defaultRaw = localStorage.getItem('exam_defaults');
  if (defaultRaw) {
    try {
      zip.file(`exam_defaults_${dateStr}.json`, JSON.stringify(JSON.parse(defaultRaw), null, 2));
      fileCount++;
    } catch(e) {}
  }
  
  if (fileCount === 0) {
    showToast('📭 エクスポートするデータがありません');
    return;
  }
  
  // ZIPを生成してダウンロード
  zip.generateAsync({ type: 'blob' })
    .then(function(content) {
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `study_all_backup_${dateStr}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`📁 ${fileCount} 個のファイルをZIPにまとめてエクスポートしました`);
    })
    .catch(function(err) {
      showToast('❌ ZIP生成に失敗しました: ' + err.message);
      console.error(err);
    });
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
