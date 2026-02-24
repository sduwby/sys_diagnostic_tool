// --- 连击系统模块 ---

let comboCount = 0;
let lastHitTime = 0;
const COMBO_TIMEOUT_CLICK = 500; // 鼠标点击：0.5秒
const COMBO_TIMEOUT_TYPE = 1000; // 键盘输入：1秒
let comboResetTimer = null;
let currentMode = 'click'; // 当前交互模式

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

// 设置交互模式（用于动态超时时间）
function setInteractionMode(mode) {
    currentMode = mode;
}

// 增加连击
function addCombo(mode = null) {
    const now = Date.now();
    const interactionMode = mode || currentMode;
    const timeout = interactionMode === 'click' ? COMBO_TIMEOUT_CLICK : COMBO_TIMEOUT_TYPE;
    
    // 如果距离上次击中超过超时时间，重置连击
    if (now - lastHitTime > timeout) {
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
    }, timeout);
    
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

// 溢出时重置连击（missed时调用）
function onMissed() {
    resetCombo();
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
    forceResetCombo,
    setInteractionMode,
    onMissed
};