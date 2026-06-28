// ==================== Token 管理 ====================
function getToken() {
    // 1. 从 config.js 双重解码
    if (CONFIG.tokenEncodedDouble && CONFIG.tokenEncodedDouble !== '') {
        try {
            // 第一次解码
            const firstDecoded = atob(CONFIG.tokenEncodedDouble);
            // 第二次解码
            const secondDecoded = atob(firstDecoded);
            if (secondDecoded && secondDecoded.startsWith('ghp_')) {
                console.log('✅ Token decoded from config.js (double)');
                return secondDecoded;
            }
        } catch(e) {
            console.error('Decode error:', e);
        }
    }
    
    // 2. 向后兼容：单次编码
    if (CONFIG.tokenEncoded && CONFIG.tokenEncoded !== '') {
        try {
            const decoded = atob(CONFIG.tokenEncoded);
            if (decoded && decoded.startsWith('ghp_')) {
                console.log('✅ Token decoded from config.js (single)');
                return decoded;
            }
        } catch(e) {}
    }
    
    // 3. 用户手动输入
    const manualToken = localStorage.getItem('github_token_manual');
    if (manualToken && manualToken.startsWith('ghp_')) {
        console.log('✅ Token from localStorage');
        return manualToken;
    }
    
    console.log('❌ No token found');
    return '';
}
