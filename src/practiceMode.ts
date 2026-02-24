// --- 练习模式模块 ---

let isPracticeMode: boolean = false;
let practiceLanguage: string | null = null; // 'all' 或特定语言名称

// 初始化练习模式UI
function initPracticeModeUI(): void {
    // 在 header 右侧添加练习模式切换按钮
    const header = document.getElementById('header');
    if (!header) return;
    
    const buttonContainer = header.querySelector('div[style*="position: absolute"]') as HTMLElement;
    if (buttonContainer) {
        const practiceModeBtn = document.createElement('button');
        practiceModeBtn.id = 'practice-mode-btn';
        practiceModeBtn.style.cssText = 'background: #3e3e42; color: #d4d4d4; border: 1px solid #555; padding: 5px 12px; cursor: pointer; font-family: "Consolas", monospace; font-size: 12px;';
        practiceModeBtn.innerHTML = '🎓 Practice: <span id="practice-status">OFF</span>';
        practiceModeBtn.onclick = togglePracticeMode;
        buttonContainer.insertBefore(practiceModeBtn, buttonContainer.firstChild);
    }
}

// 切换练习模式
function togglePracticeMode(): void {
    if (!isPracticeMode) {
        showPracticeModeConfig();
    } else {
        exitPracticeMode();
    }
}

// 显示练习模式配置面板
function showPracticeModeConfig(): void {
    const panel = document.createElement('div');
    panel.id = 'practice-config-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1e1e1e;
        border: 2px solid #4ec9b0;
        border-radius: 8px;
        padding: 25px;
        width: 400px;
        z-index: 3000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    
    const LANG_CONFIG = [
        { name: 'JS', colorClass: 'c-ts' },
        { name: 'C++', colorClass: 'c-cpp' },
        { name: 'Java', colorClass: 'c-java' },
        { name: 'Go', colorClass: 'c-go' },
        { name: 'Py', colorClass: 'c-py' }
    ];
    
    panel.innerHTML = `
        <h3 style="margin-top: 0; color: #4ec9b0; font-family: 'Consolas', monospace;">🎓 Practice Mode</h3>
        <p style="color: #d4d4d4; font-size: 13px; margin-bottom: 15px;">
            No time pressure, focus on accuracy.
        </p>
        
        <div style="margin-bottom: 20px;">
            <label style="color: #d4d4d4; display: block; margin-bottom: 10px; font-weight: bold;">Select Language:</label>
            ${LANG_CONFIG.map(lang => `
                <div style="margin-bottom: 8px;">
                    <label style="color: #d4d4d4; cursor: pointer; display: flex; align-items: center;">
                        <input type="radio" name="practice-lang" value="${lang.name}" style="margin-right: 8px;">
                        <span>${lang.name}</span>
                    </label>
                </div>
            `).join('')}
            <div style="margin-bottom: 8px;">
                <label style="color: #d4d4d4; cursor: pointer; display: flex; align-items: center;">
                    <input type="radio" name="practice-lang" value="all" checked style="margin-right: 8px;">
                    <span>All Languages (Mix)</span>
                </label>
            </div>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button onclick="closePracticeConfig()" style="background: #3e3e42; color: #d4d4d4; border: 1px solid #555; padding: 8px 16px; cursor: pointer;">Cancel</button>
            <button onclick="startPracticeMode()" style="background: #4ec9b0; color: #1e1e1e; border: none; padding: 8px 16px; cursor: pointer; font-weight: bold;">Start</button>
        </div>
    `;
    
    document.body.appendChild(panel);
}

// 关闭配置面板
(window as any).closePracticeConfig = function(): void {
    const panel = document.getElementById('practice-config-panel');
    if (panel) panel.remove();
};

// 开始练习模式
(window as any).startPracticeMode = function(): void {
    const selected = document.querySelector('input[name="practice-lang"]:checked') as HTMLInputElement;
    if (selected) {
        practiceLanguage = selected.value;
        isPracticeMode = true;
        
        // 更新UI
        const statusSpan = document.getElementById('practice-status');
        if (statusSpan) {
            statusSpan.innerText = 'ON';
            statusSpan.style.color = '#4ec9b0';
        }
        
        // 重启游戏
        (window as any).closePracticeConfig();
        location.reload();
    }
};

// 退出练习模式
function exitPracticeMode(): void {
    isPracticeMode = false;
    practiceLanguage = null;
    
    // 更新UI
    const statusSpan = document.getElementById('practice-status');
    if (statusSpan) {
        statusSpan.innerText = 'OFF';
        statusSpan.style.color = '#d4d4d4';
    }
    
    location.reload();
}

// 检查是否在练习模式
function isInPracticeMode(): boolean {
    return isPracticeMode;
}

// 获取练习语言
function getPracticeLanguage(): string | null {
    return practiceLanguage;
}

// 过滤语言配置（用于练习模式）
function filterLanguageConfig(langConfig: any[]): any[] {
    if (!isPracticeMode || practiceLanguage === 'all') {
        return langConfig;
    }
    return langConfig.filter(lang => lang.name === practiceLanguage);
}

export {
    initPracticeModeUI,
    isInPracticeMode,
    getPracticeLanguage,
    filterLanguageConfig,
    togglePracticeMode
};