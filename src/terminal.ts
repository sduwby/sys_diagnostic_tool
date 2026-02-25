// --- 终端系统模块 ---

// 命令历史
const TERMINAL_HISTORY_KEY = 'sys_diag_terminal_history';
let commandHistory: string[] = [];
let historyIndex = -1;

// 加载命令历史
try {
    const saved = localStorage.getItem(TERMINAL_HISTORY_KEY);
    if (saved) commandHistory = JSON.parse(saved);
} catch (e) {}

// 保存命令历史
function saveCommandHistory(): void {
    try {
        localStorage.setItem(TERMINAL_HISTORY_KEY, JSON.stringify(commandHistory.slice(-50)));
    } catch (e) {}
}

// 预设常用命令
export const COMMON_COMMANDS = [
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
function addTerminalOutput(text: string, color = '#888'): void {
    const terminalOutput = document.getElementById('terminal-output');
    if (!terminalOutput) return;
    
    const line = document.createElement('div');
    line.style.color = color;
    line.innerHTML = text.replace(/\n/g, '<br>');
    terminalOutput.appendChild(line);
    // 自动滚动到底部
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// 执行命令
export function executeCommand(command: string): void {
    if (!command.trim()) return;
    
    // 显示命令
    addTerminalOutput(`<span style="color: #4ec9b0;">user@system:~$</span> ${command}`, '#d4d4d4');
    
    // 添加到历史并持久化
    commandHistory.push(command);
    historyIndex = commandHistory.length;
    saveCommandHistory();
    
    // 内置命令
    if (command.trim() === 'clear') {
        const terminalOutput = document.getElementById('terminal-output');
        if (terminalOutput) terminalOutput.innerHTML = '';
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
        exec(command, { timeout: 10000, maxBuffer: 1024 * 1024 }, (error: any, stdout: string, stderr: string) => {
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
    } catch (err: any) {
        addTerminalOutput(`Failed to execute: ${err.message}`, '#f44747');
    }
}

// 初始化终端输入历史导航
export function initTerminalInput(): void {
    const terminalInput = document.getElementById('terminal-input') as HTMLInputElement;
    if (!terminalInput) return;
    
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
