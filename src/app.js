// --- 加密与存储 ---
const SECURE_STORE = {
    key: 'SYS_DIAG_2026',
    encrypt: function(text) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length));
        }
        return btoa(result);
    },
    decrypt: function(encoded) {
        try {
            let text = atob(encoded);
            let result = '';
            for (let i = 0; i < text.length; i++) {
                result += String.fromCharCode(text.charCodeAt(i) ^ this.key.charCodeAt(i % this.key.length));
            }
            return result;
        } catch (e) {
            return null;
        }
    },
    save: function(data) {
        localStorage.setItem('sys_diag_logs', this.encrypt(JSON.stringify(data)));
    },
    load: function() {
        const raw = localStorage.getItem('sys_diag_logs');
        if (!raw) return [];
        const str = this.decrypt(raw);
        return str ? JSON.parse(str) : [];
    }
};

// --- 游戏配置 ---
const LANG_CONFIG = [
    { name: 'JS', score: 1.0, speedBonus: 1.000, colorClass: 'c-ts', snippets: ['console.log(v);', 'const x = 0;', 'await fetch();', 'res.json()'] },
    { name: 'C++', score: 1.5, speedBonus: 1.025, colorClass: 'c-cpp', snippets: ['int main()', 'std::cout<<x;', 'ptr = &y;', '#include<os>'] },
    { name: 'Java', score: 2.0, speedBonus: 1.050, colorClass: 'c-java', snippets: ['public class A', 'System.out.println', 'List<?> list', 'throws Error'] },
    { name: 'Go', score: 2.5, speedBonus: 1.075, colorClass: 'c-go', snippets: ['func main()', 'fmt.Println', 'go func()', 'if err != nil'] },
    { name: 'Py', score: 3.0, speedBonus: 1.100, colorClass: 'c-py', snippets: ['def init():', 'import sys', 'print(f"{x}")', 'if __name__'] }
];

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

    const langData = LANG_CONFIG[Math.floor(Math.random() * LANG_CONFIG.length)];
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
    if (x && y) showFloatScore(x, y, amount);
}

function showFloatScore(x, y, amount) {
    const el = document.createElement('div');
    el.className = 'float-score';
    el.innerText = `+${amount.toFixed(1)}`;
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
    gameOverScreen.style.display = 'block';
    document.getElementById('current-result').innerHTML = `
        <div>Processed: <span style="color:#fff">${currentScore.toFixed(1)}</span> objects</div>
        <div style="font-size:0.9em;color:#888">Runtime: ${timerElement.innerText}</div>
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
