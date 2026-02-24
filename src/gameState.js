// --- 游戏进度保存/恢复模块 ---
const { SECURE_STORE } = require('./storage.js');
const path = require('path');
const os = require('os');
const fs = require('fs');

const GAME_STATE_FILE = path.join(os.homedir(), '.sys_diagnostic_progress');

// 保存游戏状态
function saveGameProgress(gameData) {
    try {
        const state = {
            score: gameData.currentScore,
            missedCount: gameData.missedCount,
            seconds: gameData.seconds,
            interactionMode: gameData.interactionMode,
            isPracticeMode: gameData.isPracticeMode || false,
            practiceLanguage: gameData.practiceLanguage || null,
            comboCount: gameData.comboCount || 0,
            timestamp: Date.now(),
            version: '1.0'
        };
        
        const encrypted = SECURE_STORE.encrypt(JSON.stringify(state));
        if (encrypted) {
            fs.writeFileSync(GAME_STATE_FILE, encrypted, 'utf8');
            return true;
        }
        return false;
    } catch (e) {
        console.error('Failed to save game progress:', e);
        return false;
    }
}

// 加载游戏状态
function loadGameProgress() {
    try {
        if (!fs.existsSync(GAME_STATE_FILE)) {
            return null;
        }
        
        const encrypted = fs.readFileSync(GAME_STATE_FILE, 'utf8');
        const str = SECURE_STORE.decrypt(encrypted);
        if (!str) return null;
        
        const state = JSON.parse(str);
        
        // 检查版本兼容性
        if (state.version !== '1.0') {
            console.warn('Incompatible save version');
            return null;
        }
        
        // 检查是否过期（24小时）
        const age = Date.now() - state.timestamp;
        if (age > 24 * 60 * 60 * 1000) {
            console.log('Save data expired');
            deleteSaveData();
            return null;
        }
        
        return state;
    } catch (e) {
        console.error('Failed to load game progress:', e);
        return null;
    }
}

// 删除存档
function deleteSaveData() {
    try {
        if (fs.existsSync(GAME_STATE_FILE)) {
            fs.unlinkSync(GAME_STATE_FILE);
            return true;
        }
        return false;
    } catch (e) {
        console.error('Failed to delete save data:', e);
        return false;
    }
}

// 检查是否有存档
function hasSaveData() {
    try {
        return fs.existsSync(GAME_STATE_FILE);
    } catch (e) {
        return false;
    }
}

// 显示恢复进度提示
function showRestorePrompt(onRestore, onNewGame) {
    const prompt = document.createElement('div');
    prompt.id = 'restore-prompt';
    prompt.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1e1e1e;
        border: 2px solid #4ec9b0;
        border-radius: 8px;
        padding: 25px;
        width: 400px;
        z-index: 5000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    
    const saveData = loadGameProgress();
    if (!saveData) {
        onNewGame();
        return;
    }
    
    prompt.innerHTML = `
        <h3 style="margin-top: 0; color: #4ec9b0; font-family: 'Consolas', monospace;">💾 Progress Found</h3>
        <p style="color: #d4d4d4; font-size: 13px; margin-bottom: 15px;">
            A previous session was found. Do you want to continue?
        </p>
        
        <div style="background: #2d2d30; padding: 15px; border-radius: 4px; margin-bottom: 20px; font-family: 'Consolas', monospace; font-size: 12px; color: #d4d4d4;">
            <div>Objects: <span style="color: #4ec9b0;">${saveData.score.toFixed(1)}</span></div>
            <div>Time: <span style="color: #4ec9b0;">${Math.floor(saveData.seconds / 60)}:${(saveData.seconds % 60).toString().padStart(2, '0')}</span></div>
            <div>Mode: <span style="color: #4ec9b0;">${saveData.interactionMode}</span></div>
            ${saveData.isPracticeMode ? `<div>Practice: <span style="color: #dcdcaa;">${saveData.practiceLanguage || 'All'}</span></div>` : ''}
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="new-game-btn" style="background: #3e3e42; color: #d4d4d4; border: 1px solid #555; padding: 8px 16px; cursor: pointer;">New Game</button>
            <button id="restore-btn" style="background: #4ec9b0; color: #1e1e1e; border: none; padding: 8px 16px; cursor: pointer; font-weight: bold;">Continue</button>
        </div>
    `;
    
    document.body.appendChild(prompt);
    
    document.getElementById('restore-btn').onclick = () => {
        prompt.remove();
        onRestore(saveData);
    };
    
    document.getElementById('new-game-btn').onclick = () => {
        prompt.remove();
        deleteSaveData();
        onNewGame();
    };
}

module.exports = {
    saveGameProgress,
    loadGameProgress,
    deleteSaveData,
    hasSaveData,
    showRestorePrompt
};