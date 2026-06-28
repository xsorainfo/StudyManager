// scripts/config.js - 占位文件
// 在 GitHub Actions 中会被自动替换

window.GITHUB_CONFIG = {
    token: '',  // 本地开发时，请在下方手动输入
    owner: '您的GitHub用户名',
    repo: '您的仓库名',
    path: 'data/data.json',
    branch: 'main'
};

// 本地开发用 - 取消注释并填入您的Token
// window.GITHUB_CONFIG.token = 'ghp_xxxxxxxxxxxxxxxxxxxx';

console.log('⚠️ 本地开发模式: config.js 占位文件');
