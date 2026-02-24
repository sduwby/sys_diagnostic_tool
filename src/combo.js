// --- 连击系统模块 ---

let comboCount = 0;
let lastHitTime = 0;
const COMBO_TIMEOUT = 2000; // 2秒内连击有效
let comboResetTimer = null;

// 初始化连击显示元素
function initComboDisplay() {
    const comboDiv = document.createElement('div');
    comboDiv.id = 'combo-display';
    comboDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        font-size: 60px;
        font-weight: bold;
        color: #4ec9b0;
        text-shadow: 0 0 20px rgba(78, 201, 176, 0.8);
        font-family: 'Consolas', monospace;
        z-index: 9999;
        pointer-events: none;
        transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    document.body.appendChild(comboDiv);
}

// 增加连击
function addCombo() {
    const now = Date.now();
    
    // 如果距离上次击中超过2秒，重置连击
    if (now - lastHitTime > COMBO_TIMEOUT) {
        comboCount = 0;
    }
    
    comboCount++;
    lastHitTime = now;
    
    // 显示连击
    if (comboCount >= 3) {
        showCombo();
    }
    
    // 重置定时器
    if (comboResetTimer) {
        clearTimeout(comboResetTimer);
    }
    comboResetTimer = setTimeout(() => {
        resetCombo();
    }, COMBO_TIMEOUT);
    
    return comboCount;
}

// 显示连击特效
function showCombo() {
    const comboDiv = document.getElementById('combo-display');
    if (!comboDiv) return;
    
    // 根据连击数调整颜色和大小
    let color = '#4ec9b0';
    let scale = 1;
    
    if (comboCount >= 10) {
        color = '#ff79c6'; // 粉色
        scale = 1.5;
    } else if (comboCount >= 5) {
        color = '#dcdcaa'; // 黄色
        scale = 1.2;
    }
    
    comboDiv.innerText = `COMBO x${comboCount}`;
    comboDiv.style.color = color;
    comboDiv.style.transform = `translate(-50%, -50%) scale(${scale})`;
    
    // 动画效果
    setTimeout(() => {
        comboDiv.style.transform = 'translate(-50%, -50%) scale(0)';
    }, 1000);
}

// 重置连击
function resetCombo() {
    if (comboCount >= 3) {
        // 显示连击结束
        const comboDiv = document.getElementById('combo-display');
        if (comboDiv) {
            comboDiv.innerText = `${comboCount} HIT COMBO!`;
            comboDiv.style.color = '#888';
            comboDiv.style.transform = 'translate(-50%, -50%) scale(0.8)';
            setTimeout(() => {
                comboDiv.style.transform = 'translate(-50%, -50%) scale(0)';
            }, 1500);
        }
    }
    comboCount = 0;
}

// 获取当前连击数
function getComboCount() {
    return comboCount;
}

// 强制重置连击（游戏结束时调用）
function forceResetCombo() {
    comboCount = 0;
    lastHitTime = 0;
    if (comboResetTimer) {
        clearTimeout(comboResetTimer);
        comboResetTimer = null;
    }
}

module.exports = {
    initComboDisplay,
    addCombo,
    resetCombo,
    getComboCount,
    forceResetCombo
};