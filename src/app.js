// --- 导入模块 ---
const { SECURE_STORE, CUSTOM_SNIPPETS_STORE, ACHIEVEMENT_STORE } = require('./storage.js');
const { ACHIEVEMENTS } = require('./achievements.js');
const { initComboDisplay, addCombo, forceResetCombo, getComboCount } = require('./combo.js');
const { initPracticeModeUI, isInPracticeMode, filterLanguageConfig } = require('./practiceMode.js');
const { saveGameProgress, showRestorePrompt, deleteSaveData } = require('./gameState.js');
require('./analytics.js'); // Analytics 函数挂载到 window
require('./achievementUI.js'); // Achievement UI 函数挂载到 window

// 加载成就数据
let achievementData = ACHIEVEMENT_STORE.load();

// --- 游戏配置 ---
const LANG_CONFIG = [
    { name: 'JS', score: 1.0, speedBonus: 1.000, colorClass: 'c-ts', snippets: ['console.log(v);', 'const x = 0;', 'await fetch();', 'res.json()'] },
    { name: 'C++', score: 1.5, speedBonus: 1.025, colorClass: 'c-cpp', snippets: ['int main()', 'std::cout<<x;', 'ptr = &y;', '#include<os>'] },
    { name: 'Java', score: 2.0, speedBonus: 1.050, colorClass: 'c-java', snippets: ['public class A', 'System.out.println', 'List<?> list', 'throws Error'] },
    { name: 'Go', score: 2.5, speedBonus: 1.075, colorClass: 'c-go', snippets: ['func main()', 'fmt.Println', 'go func()', 'if err != nil'] },
    { name: 'Py', score: 3.0, speedBonus: 1.100, colorClass: 'c-py', snippets: ['def init():', 'import sys', 'print(f"{x}")', 'if __name__'] }
];

// 自定义代码库配置
const CUSTOM_LANG = { 
    name: 'Custom', 
    score: 1.5, 
    speedBonus: 1.000, 
    colorClass: 'c-custom', 
    snippets: [] 
};

// 加载自定义代码片段
let customSnippets = CUSTOM_SNIPPETS_STORE.load();
CUSTOM_LANG.snippets = customSnippets;

const container = document.getElementById('game-container');
const scoreElement = document.getElementById('score');
const stabilityElement = document.getElementById('stability');
const timerElement = document.getElementById('timer');
const levelElement = document.getElementById('level');
const mainUI = document.getElementById('main-ui');
const fakeScreen = document.getElementById('fake-screen');
const gameOverScreen = document.getElementById('game-over');
const cheatMsg = document.getElementById('cheat-msg');
const modeToggleBtn = document.getElementById('mode-toggle');
const modeText = document.getElementById('mode-text');
const typingInputArea = document.getElementById('typing-input-area');
const typingInput = document.getElementById('typing-input');

let currentScore = 0.0;
let missedCount = 0;
let seconds = 0;
let isBossMode = false;
let isGameOver = false;
let globalSpeedMultiplier = 1.0;
let interactionMode = 'click'; // 'click' or 'type'

// --- 作弊状态变量 ---
let inputBuffer = ''; // 记录按键
let cheatWallActive = false; // black sheep wall
let cheatMoneyTimer = null; // show me money

// --- 公式化难度系统 ---
// 难度随时间平滑上升：速度倍率 = 1.0 + (时间秒数/120)^1.2 * 0.5
// 这意味着：0秒=1.0x, 60秒=1.185x, 120秒=1.5x, 180秒=1.86x, 240秒=2.25x
function getDifficultyMultiplier() {
    return 1.0 + Math.pow(seconds / 120, 1.2) * 0.5;
}

const getLevel = () => Math.floor(seconds / 60) + 1;
const getMaxMisses = (lv) => 10 + (lv - 1) * 5;

// --- 核心生成逻辑 ---
function createSnippet() {
    if (isBossMode || isGameOver) return;

    // 混合使用内置和自定义代码片段，并根据练习模式过滤
    let availableConfigs = filterLanguageConfig([...LANG_CONFIG]);
    if (CUSTOM_LANG.snippets.length > 0 && !isInPracticeMode()) {
        availableConfigs.push(CUSTOM_LANG);
    }
    
    if (availableConfigs.length === 0) {
        availableConfigs = LANG_CONFIG; // 回退到默认配置
    }
    
    const langData = availableConfigs[Math.floor(Math.random() * availableConfigs.length)];
    const text = langData.snippets[Math.floor(Math.random() * langData.snippets.length)];
    const div = document.createElement('div');
    div.className = `code-line ${langData.colorClass}`;
    div.innerText = text;
    div.dataset.text = text; // 存储文本用于键盘匹配

    const x = Math.random() * (window.innerWidth - 200);
    let y = window.innerHeight;
    let isPaused = false;

    div.style.left = x + 'px';
    div.style.top = y + 'px';

    div.onmouseenter = () => { isPaused = true; };
    div.onmouseleave = () => { isPaused = false; };

    // 点击模式
    if (interactionMode === 'click') {
        div.onclick = (e) => {
            trackClick(); // 追踪点击
            addScore(langData.score, e.clientX, e.clientY);
            div.remove();
        };
    } else {
        // 键盘模式下高亮匹配项
        div.style.cursor = 'default';
    }

    container.appendChild(div);

    const totalSpeed = (1.0 + Math.random() * 1.5) * langData.speedBonus * globalSpeedMultiplier;

    function move() {
        if (isBossMode || isGameOver) {
            div.remove();
            return;
        }
        if (!isPaused) {
            y -= totalSpeed;

            // --- 作弊逻辑：Wall 模式下，代码在顶部 40px 处停住 ---
            if (cheatWallActive && y < 40) {
                y = 40;
            } else {
                div.style.top = y + 'px';
            }
        }

        // --- 正常销毁逻辑 ---
        if (y < 40 && !cheatWallActive) { // Wall 模式下不销毁
            missedCount++;
            div.remove();
        } else if (!cheatWallActive || y > 40) { // 如果没激活作弊，或者虽然激活但还没到顶，继续动画
            requestAnimationFrame(move);
        } else if (cheatWallActive && y <= 40) {
            // Wall 模式下，已经到顶了，保持不动，继续循环检测状态以便作弊结束后恢复运动
            requestAnimationFrame(move);
        }
    }
    requestAnimationFrame(move);
}

function addScore(amount, x, y) {
    currentScore += amount;
    currentScore = Math.round(currentScore * 10) / 10;
    scoreElement.innerText = currentScore.toFixed(1);
    
    // 添加连击
    const combo = addCombo();
    
    if (x && y) showFloatScore(x, y, amount, combo);
}

function showFloatScore(x, y, amount, combo) {
    const el = document.createElement('div');
    el.className = 'float-score';
    
    // 如果有连击，显示连击数
    if (combo && combo >= 2) {
        el.innerText = `+${amount.toFixed(1)} (x${combo})`;
        el.style.color = combo >= 5 ? '#dcdcaa' : '#4ec9b0';
    } else {
        el.innerText = `+${amount.toFixed(1)}`;
    }
    
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
}

// --- 游戏主循环 ---
setInterval(() => {
    if (!isBossMode && !isGameOver) {
        seconds++;
        const lv = getLevel();
        timerElement.innerText = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        levelElement.innerText = lv;
        globalSpeedMultiplier = getDifficultyMultiplier(); // 使用公式化难度

        const stability = Math.max(0, 100 - (missedCount / getMaxMisses(lv) * 100));
        stabilityElement.innerText = Math.floor(stability);

        if (missedCount >= getMaxMisses(lv)) {
            triggerGameOver();
        }
    }
}, 1000);

const gameLoop = () => {
    if (!isBossMode && !isGameOver) createSnippet();
    const interval = 700 / globalSpeedMultiplier;
    setTimeout(gameLoop, interval);
};
gameLoop();

// --- 模式切换 ---
modeToggleBtn.addEventListener('click', () => {
    interactionMode = interactionMode === 'click' ? 'type' : 'click';
    modeText.innerText = interactionMode === 'click' ? 'Click' : 'Type';
    
    if (interactionMode === 'type') {
        typingInputArea.style.display = 'block';
        typingInput.focus();
    } else {
        typingInputArea.style.display = 'none';
    }
});

// --- 键盘输入匹配逻辑 ---
if (typingInput) {
    typingInput.addEventListener('input', () => {
        const inputValue = typingInput.value.trim();
        if (inputValue.length === 0) {
            // 清除所有高亮
            document.querySelectorAll('.code-line').forEach(el => {
                el.style.outline = 'none';
            });
            return;
        }

        // 查找匹配的代码片段
        let matched = false;
        document.querySelectorAll('.code-line').forEach(el => {
            const text = el.dataset.text;
            if (text && text.toLowerCase().includes(inputValue.toLowerCase())) {
                el.style.outline = '2px solid #4ec9b0';
                matched = true;
            } else {
                el.style.outline = 'none';
            }
        });
    });

    typingInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const inputValue = typingInput.value.trim();
            
            // 查找前缀匹配的代码片段（至少6个字符，且必须唯一匹配）
            if (inputValue.length < 6) return; // 至少6个字符
            
            const allSnippets = Array.from(document.querySelectorAll('.code-line'));
            const matchedSnippets = allSnippets.filter(el => {
                const text = el.dataset.text;
                return text && text.toLowerCase().startsWith(inputValue.toLowerCase());
            });

            // 必须是唯一匹配
            if (matchedSnippets.length === 1) {
                const matched = matchedSnippets[0];
                trackClick(); // 追踪键盘匹配（也算作点击）
                // 计算得分（根据语言配置）
                const className = matched.className;
                let score = 1.0;
                for (const lang of LANG_CONFIG) {
                    if (className.includes(lang.colorClass)) {
                        score = lang.score;
                        break;
                    }
                }
                
                const rect = matched.getBoundingClientRect();
                addScore(score, rect.left + rect.width / 2, rect.top + rect.height / 2);
                matched.remove();
                typingInput.value = '';
                
                // 清除所有高亮
                document.querySelectorAll('.code-line').forEach(el => {
                    el.style.outline = 'none';
                });
            }
        }
    });
}

// --- 键盘事件与作弊检测 ---
window.addEventListener('keydown', (e) => {
    // 如果在打字输入框或排行榜输入框中，不处理作弊码
    if (e.target === typingInput || e.target === document.getElementById('player-name') || e.target === document.getElementById('terminal-input')) {
        return;
    }

    // Boss 键
    if (e.key === 'Escape' && !isGameOver) {
        trackBossKey(); // 追踪 Boss 键按下
        isBossMode = !isBossMode;
        if (isBossMode) {
            mainUI.classList.add('hidden');
            fakeScreen.style.display = 'block';
            container.innerHTML = '';
            // 聚焦命令行输入框
            setTimeout(() => {
                const terminalInput = document.getElementById('terminal-input');
                if (terminalInput) terminalInput.focus();
            }, 100);
        } else {
            trackBossKeyRelease(); // 追踪 Boss 键释放（计算反应时间）
            mainUI.classList.remove('hidden');
            fakeScreen.style.display = 'none';
        }
        return;
    }

    // 排行榜输入
    if (e.key === 'Enter' && isGameOver && !document.getElementById('input-area').classList.contains('hidden')) {
        submitScore();
        return;
    }

    // --- 作弊码检测 ---
    if (e.key.length === 1) { // 只记录单字符
        trackKeyPress(); // 追踪键盘按键（用于检测高并发）
        inputBuffer += e.key.toLowerCase();
        if (inputBuffer.length > 50) inputBuffer = inputBuffer.slice(-50); // 限制缓冲区

        // Cheat 1: black sheep wall (2分钟无敌)
        if (inputBuffer.endsWith('black sheep wall')) {
            activateCheat('WALL HACK: INVINCIBLE (2m)');
            cheatWallActive = true;
            setTimeout(() => {
                cheatWallActive = false;
                showCheatMsg('WALL HACK EXPIRED');
            }, 120000);
            inputBuffer = ''; // 清空防止重复触发
        }

        // Cheat 2: show me money (1分钟自动加分)
        if (inputBuffer.endsWith('show me money')) {
            activateCheat('MONEY HACK: AUTO-FARM (1m)');
            if (cheatMoneyTimer) clearInterval(cheatMoneyTimer);

            cheatMoneyTimer = setInterval(() => {
                if (!isBossMode && !isGameOver) {
                    const bonus = Math.floor(Math.random() * 11) + 10; // 10-20
                    addScore(bonus);
                    // 在屏幕中间随机位置飘字
                    const rx = window.innerWidth / 2 + (Math.random() * 200 - 100);
                    const ry = window.innerHeight / 2 + (Math.random() * 100 - 50);
                    showFloatScore(rx, ry, bonus);
                }
            }, 1000);

            setTimeout(() => {
                clearInterval(cheatMoneyTimer);
                showCheatMsg('MONEY HACK EXPIRED');
            }, 60000);
            inputBuffer = '';
        }
        
        // Cheat 3: coffee (Kernel Inject 成就)
        if (inputBuffer.endsWith('coffee')) {
            achievementData.stats.coffeeCode = true;
            ACHIEVEMENT_STORE.save(achievementData);
            checkAndUnlockAchievement('kernel_inject', true);
            activateCheat('KERNEL PATCH: PERFORMANCE BOOST');
            globalSpeedMultiplier *= 0.8; // 降低速度20%
            inputBuffer = '';
        }
    }
});

function activateCheat(text) {
    showCheatMsg(text);
    // 特效：全屏闪烁一下绿色
    document.body.style.boxShadow = 'inset 0 0 50px #6a9955';
    setTimeout(() => { document.body.style.boxShadow = 'none'; }, 500);
}

function showCheatMsg(text) {
    cheatMsg.innerText = `[ SYSTEM OVERRIDE: ${text} ]`;
    cheatMsg.style.display = 'block';
    setTimeout(() => { cheatMsg.style.display = 'none'; }, 3000);
}

// --- 排行榜相关 (保持不变) ---
function triggerGameOver() {
    isGameOver = true;
    forceResetCombo(); // 重置连击
    deleteSaveData(); // 清除存档
    onGameEnd(seconds); // 调用成就系统钩子
    gameOverScreen.style.display = 'block';
    document.getElementById('current-result').innerHTML = `
        <div>Processed: <span style="color:#fff">${currentScore.toFixed(1)}</span> objects</div>
        <div style="font-size:0.9em;color:#888">Runtime: ${timerElement.innerText}</div>
        ${getComboCount() > 0 ? `<div style="font-size:0.9em;color:#dcdcaa">Max Combo: x${getComboCount()}</div>` : ''}
    `;
    checkHighScores();
}

function checkHighScores() {
    const scores = SECURE_STORE.load();
    const isQualified = scores.length < 10 || currentScore > scores[scores.length - 1].score;
    if (isQualified) {
        document.getElementById('input-area').classList.remove('hidden');
        setTimeout(() => { document.getElementById('player-name').focus(); }, 100);
    } else {
        renderLeaderboard(scores);
    }
}

window.submitScore = function() {
    const name = document.getElementById('player-name').value.trim() || 'Guest';
    const scores = SECURE_STORE.load();
    scores.push({ name: name, score: currentScore, date: new Date().toLocaleDateString(), timestamp: Date.now() });
    scores.sort((a, b) => b.score - a.score || a.timestamp - b.timestamp);
    if (scores.length > 10) scores.length = 10;
    SECURE_STORE.save(scores);
    
    // 标记首次数据保存
    if (!achievementData.stats.firstDataSave) {
        achievementData.stats.firstDataSave = true;
        ACHIEVEMENT_STORE.save(achievementData);
        checkAndUnlockAchievement('persistence', true);
    }
    
    document.getElementById('input-area').classList.add('hidden');
    renderLeaderboard(scores);
};

function renderLeaderboard(scores) {
    const tbody = document.getElementById('lb-body');
    tbody.innerHTML = '';
    if (scores.length === 0) tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No logs.</td></tr>';
    scores.forEach((s, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${index + 1}</td><td style="color:#ce9178">${s.name}</td><td style="font-weight:bold">${s.score.toFixed(1)}</td><td style="font-size:0.8em">${s.date}</td>`;
        tbody.appendChild(tr);
    });
}

// --- 数据导出功能 ---
window.exportScores = function(format = 'json') {
    const scores = SECURE_STORE.load();
    if (scores.length === 0) {
        alert('No data to export.');
        return;
    }
    
    let content = '';
    let filename = '';
    let mimeType = '';
    
    if (format === 'json') {
        content = JSON.stringify(scores, null, 2);
        filename = `diagnostic_logs_${Date.now()}.json`;
        mimeType = 'application/json';
    } else if (format === 'csv') {
        const headers = 'Rank,User,Objects,Date\n';
        const rows = scores.map((s, i) => `${i+1},${s.name},${s.score},${s.date}`).join('\n');
        content = headers + rows;
        filename = `diagnostic_logs_${Date.now()}.csv`;
        mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
};

// --- 自定义代码库管理 ---
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');

settingsBtn.addEventListener('click', () => {
    settingsPanel.style.display = 'block';
    renderCustomSnippetsList();
});

window.closeSettings = function() {
    settingsPanel.style.display = 'none';
};

window.addCustomSnippet = function() {
    const input = document.getElementById('new-snippet-input');
    const text = input.value.trim();
    
    if (!text) {
        alert('Please enter a code snippet.');
        return;
    }
    
    if (text.length < 3) {
        alert('Snippet must be at least 3 characters long.');
        return;
    }
    
    if (CUSTOM_LANG.snippets.includes(text)) {
        alert('This snippet already exists.');
        return;
    }
    
    CUSTOM_LANG.snippets.push(text);
    CUSTOM_SNIPPETS_STORE.save(CUSTOM_LANG.snippets);
    input.value = '';
    renderCustomSnippetsList();
    
    // 标记设置已保存
    if (!achievementData.stats.settingsSaved) {
        achievementData.stats.settingsSaved = true;
        ACHIEVEMENT_STORE.save(achievementData);
        checkAndUnlockAchievement('config_sync', true);
    }
};

function removeCustomSnippet(index) {
    CUSTOM_LANG.snippets.splice(index, 1);
    CUSTOM_SNIPPETS_STORE.save(CUSTOM_LANG.snippets);
    renderCustomSnippetsList();
}

function renderCustomSnippetsList() {
    const list = document.getElementById('custom-snippets-list');
    const emptyHint = document.getElementById('empty-hint');
    
    if (CUSTOM_LANG.snippets.length === 0) {
        emptyHint.style.display = 'block';
        list.innerHTML = '<div style="color: #888; font-size: 12px; font-style: italic;" id="empty-hint">No custom snippets yet.</div>';
        return;
    }
    
    emptyHint.style.display = 'none';
    list.innerHTML = CUSTOM_LANG.snippets.map((snippet, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #3e3e42;">
            <code style="color: #d4d4d4; flex: 1;">${snippet}</code>
            <button onclick="removeCustomSnippet(${index})" style="background: #f44747; color: #fff; border: none; padding: 4px 8px; cursor: pointer; border-radius: 2px;">✕</button>
        </div>
    `).join('');
}

window.removeCustomSnippet = removeCustomSnippet;

window.exportCustomSnippets = function() {
    if (CUSTOM_LANG.snippets.length === 0) {
        alert('No custom snippets to export.');
        return;
    }
    
    const content = JSON.stringify(CUSTOM_LANG.snippets, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom_snippets_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

window.importSnippets = function() {
    const fileInput = document.getElementById('import-file-input');
    fileInput.click();
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const imported = JSON.parse(event.target.result);
                if (!Array.isArray(imported)) {
                    alert('Invalid format. Expected JSON array.');
                    return;
                }
                
                let added = 0;
                imported.forEach(snippet => {
                    if (typeof snippet === 'string' && snippet.length >= 3 && !CUSTOM_LANG.snippets.includes(snippet)) {
                        CUSTOM_LANG.snippets.push(snippet);
                        added++;
                    }
                });
                
                if (added > 0) {
                    CUSTOM_SNIPPETS_STORE.save(CUSTOM_LANG.snippets);
                    renderCustomSnippetsList();
                    alert(`Successfully imported ${added} snippet(s).`);
                } else {
                    alert('No new snippets were imported.');
                }
            } catch (e) {
                alert('Failed to parse JSON file.');
            }
        };
        reader.readAsText(file);
        fileInput.value = '';
    };
};

// --- 命令行功能 ---
const terminalOutput = document.getElementById('terminal-output');
const terminalInput = document.getElementById('terminal-input');

// 命令历史（持久化）
const TERMINAL_HISTORY_KEY = 'sys_diag_terminal_history';
let commandHistory = [];
let historyIndex = -1;

// 加载命令历史
try {
    const saved = localStorage.getItem(TERMINAL_HISTORY_KEY);
    if (saved) commandHistory = JSON.parse(saved);
} catch (e) {}

// 保存命令历史
function saveCommandHistory() {
    try {
        localStorage.setItem(TERMINAL_HISTORY_KEY, JSON.stringify(commandHistory.slice(-50)));
    } catch (e) {}
}

// 预设常用命令
const COMMON_COMMANDS = [
    'git status',
    'npm run build',
    'docker ps',
    'kubectl get pods',
    'tail -f /var/log/syslog',
    'htop',
    'df -h',
    'free -m'
];

// 添加输出到终端
function addTerminalOutput(text, color = '#888') {
    const line = document.createElement('div');
    line.style.color = color;
    line.innerHTML = text.replace(/\n/g, '<br>');
    terminalOutput.appendChild(line);
    // 自动滚动到底部
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// 执行命令
function executeCommand(command) {
    if (!command.trim()) return;
    
    // 显示命令
    addTerminalOutput(`<span style="color: #4ec9b0;">user@system:~$</span> ${command}`, '#d4d4d4');
    
    // 添加到历史并持久化
    commandHistory.push(command);
    historyIndex = commandHistory.length;
    saveCommandHistory();
    
    // 内置命令
    if (command.trim() === 'clear') {
        terminalOutput.innerHTML = '';
        return;
    }
    
    if (command.trim() === 'help') {
        addTerminalOutput('Available commands:\n  clear - Clear terminal\n  help - Show this help\n  history - Show command history\n  Or enter any system command', '#6a9955');
        return;
    }
    
    if (command.trim() === 'history') {
        const recentHistory = commandHistory.slice(-20).map((cmd, i) => `  ${i+1}. ${cmd}`).join('\n');
        addTerminalOutput(recentHistory || 'No history.', '#888');
        return;
    }
    
    // 执行系统命令
    try {
        const { exec } = require('child_process');
        exec(command, { timeout: 10000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                addTerminalOutput(`Error: ${error.message}`, '#f44747');
                return;
            }
            if (stderr) {
                addTerminalOutput(stderr, '#ce9178');
            }
            if (stdout) {
                addTerminalOutput(stdout, '#d4d4d4');
            }
            if (!stdout && !stderr) {
                addTerminalOutput('[Command executed successfully]', '#6a9955');
            }
        });
    } catch (err) {
        addTerminalOutput(`Failed to execute: ${err.message}`, '#f44747');
    }
}

// 监听终端输入
if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const command = terminalInput.value;
            executeCommand(command);
            terminalInput.value = '';
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex] || '';
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex] || '';
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
            }
        }
    });
}



// --- 成就系统核心函数 ---
let sessionStartTime = Date.now();
let keyPressTimestamps = [];
let bossKeyPressTime = null;

// 初始化成就
function initAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (!achievementData.achievements[achievement.id]) {
            achievementData.achievements[achievement.id] = {
                id: achievement.id,
                name: achievement.name,
                tier: achievement.tier,
                description: achievement.description,
                unlocked: false,
                unlockedAt: null,
                progress: 0
            };
        }
    });
    
    // 首次启动自动解锁 Env Ready
    checkAndUnlockAchievement('env_ready');
}

// 检测并解锁成就
function checkAndUnlockAchievement(achievementId, showNotification = true) {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;
    
    const achievementState = achievementData.achievements[achievementId];
    if (achievementState.unlocked) return; // 已解锁
    
    const isUnlocked = achievement.check(achievementData.stats, achievementData.achievements);
    
    if (isUnlocked) {
        achievementState.unlocked = true;
        achievementState.unlockedAt = new Date().toISOString();
        achievementState.progress = achievement.requirement || 100;
        
        ACHIEVEMENT_STORE.save(achievementData);
        
        if (showNotification) {
            showAchievementNotification(achievement);
        }
        
        // 检查是否解锁了 Final Build
        checkAndUnlockAchievement('final_build', true);
    }
}

// 批量检测成就
function checkAchievements() {
    ACHIEVEMENTS.forEach(achievement => {
        if (achievement.id !== 'env_ready') {
            checkAndUnlockAchievement(achievement.id, true);
        }
    });
    
    // 更新进度
    ACHIEVEMENTS.forEach(achievement => {
        const achievementState = achievementData.achievements[achievement.id];
        if (!achievementState.unlocked && achievement.current) {
            achievementState.progress = achievement.current(achievementData.stats);
        }
    });
}

// 成就解锁通知
function showAchievementNotification(achievement) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #4ec9b0 0%, #3aa38f 100%);
        color: #fff;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(78, 201, 176, 0.4);
        font-family: 'Consolas', monospace;
        font-size: 13px;
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
    `;
    
    const tierNames = ['', 'Entry Level', 'Senior Dev', 'Tech Lead', 'Chief Architect'];
    
    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">
            🏆 Achievement Unlocked
        </div>
        <div style="font-size: 12px; opacity: 0.9; margin-bottom: 3px;">
            [${tierNames[achievement.tier]}] ${achievement.name}
        </div>
        <div style="font-size: 11px; opacity: 0.7;">
            ${achievement.description}
        </div>
    `;
    
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 统计追踪函数
function trackClick() {
    achievementData.stats.totalClicks++;
    checkAndUnlockAchievement('unit_pass', true);
    checkAndUnlockAchievement('big_data', true);
}

function trackKeyPress() {
    const now = Date.now();
    keyPressTimestamps.push(now);
    
    // 保留最近1秒的按键
    keyPressTimestamps = keyPressTimestamps.filter(t => now - t < 1000);
    
    if (keyPressTimestamps.length > achievementData.stats.maxConcurrentKeys) {
        achievementData.stats.maxConcurrentKeys = keyPressTimestamps.length;
        checkAndUnlockAchievement('high_concurrency', true);
    }
}

function trackBossKey() {
    if (!achievementData.stats.bossKeyUsed) {
        achievementData.stats.bossKeyUsed = true;
        checkAndUnlockAchievement('hotfix', true);
    }
    
    // 记录 Boss 键按下时间（用于计算反应速度）
    bossKeyPressTime = Date.now();
}

function trackBossKeyRelease() {
    if (bossKeyPressTime) {
        const responseTime = Date.now() - bossKeyPressTime;
        if (responseTime < achievementData.stats.fastestBossKeyResponse) {
            achievementData.stats.fastestBossKeyResponse = responseTime;
            checkAndUnlockAchievement('zero_latency', true);
        }
        bossKeyPressTime = null;
    }
}

// 周五下午检测
function checkFridayAfternoon() {
    const now = new Date();
    if (now.getDay() === 5 && now.getHours() >= 16) {
        achievementData.stats.fridayAfternoon = true;
        checkAndUnlockAchievement('friday_warrior', true);
    }
}

// 游戏结束钩子
function onGameEnd(completionTime) {
    achievementData.stats.sessionsCompleted++;
    
    // Agile Sprint: 10分钟内完成
    if (completionTime <= 600) {
        achievementData.stats.fastGameCompletion = true;
        checkAndUnlockAchievement('agile_sprint', true);
    }
    
    // Stress Test: 持续1分钟不中断
    if (completionTime >= 60 && missedCount === 0) {
        achievementData.stats.longSession = true;
        checkAndUnlockAchievement('stress_test', true);
    }
    
    // 保存统计数据
    ACHIEVEMENT_STORE.save(achievementData);
}

// 运行时统计更新（每秒）
setInterval(() => {
    if (!isBossMode && !isGameOver) {
        achievementData.stats.totalRuntime++;
        
        checkAndUnlockAchievement('heartbeat', true);
        checkAndUnlockAchievement('high_availability', true);
        checkAndUnlockAchievement('five_nines', true);
        
        checkFridayAfternoon();
    }
}, 1000);

// 窗口可见性变化检测（用于 Full Stack）
let visibilityHidden = false;
document.addEventListener('visibilitychange', () => {
    if (document.hidden && !visibilityHidden) {
        visibilityHidden = true;
    } else if (!document.hidden && visibilityHidden) {
        achievementData.stats.tabSwitchCount++;
        checkAndUnlockAchievement('full_stack', true);
        visibilityHidden = false;
    }
});

// 初始化
initComboDisplay(); // 初始化连击显示
initPracticeModeUI(); // 初始化练习模式UI
initAchievements();
checkFridayAfternoon();

// 练习模式下禁用难度增长
if (isInPracticeMode()) {
    globalSpeedMultiplier = 1.0; // 固定难度
}

// 添加进度保存功能（每30秒自动保存）
setInterval(() => {
    if (!isBossMode && !isGameOver && !isInPracticeMode()) {
        saveGameProgress({
            currentScore,
            missedCount,
            seconds,
            interactionMode,
            isPracticeMode: isInPracticeMode(),
            comboCount: getComboCount()
        });
    }
}, 30000);

// 页面关闭前保存进度
window.addEventListener('beforeunload', () => {
    if (!isGameOver && !isInPracticeMode()) {
        saveGameProgress({
            currentScore,
            missedCount,
            seconds,
            interactionMode,
            isPracticeMode: isInPracticeMode(),
            comboCount: getComboCount()
        });
    }
});
