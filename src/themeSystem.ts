// --- 主题系统模块 ---

export interface Theme {
    id: string;
    name: string;
    colors: {
        background: string;
        primary: string;
        secondary: string;
        accent: string;
        text: string;
        textDim: string;
        success: string;
        warning: string;
        error: string;
        border: string;
    };
}

// 预设主题
export const PRESET_THEMES: Theme[] = [
    {
        id: 'vscode_dark',
        name: 'VS Code Dark (默认)',
        colors: {
            background: '#1e1e1e',
            primary: '#4ec9b0',
            secondary: '#569cd6',
            accent: '#dcdcaa',
            text: '#d4d4d4',
            textDim: '#888',
            success: '#6a9955',
            warning: '#ce9178',
            error: '#f44747',
            border: '#555'
        }
    },
    {
        id: 'github_dark',
        name: 'GitHub Dark',
        colors: {
            background: '#0d1117',
            primary: '#58a6ff',
            secondary: '#79c0ff',
            accent: '#ffa657',
            text: '#c9d1d9',
            textDim: '#8b949e',
            success: '#3fb950',
            warning: '#d29922',
            error: '#f85149',
            border: '#30363d'
        }
    },
    {
        id: 'monokai',
        name: 'Monokai Pro',
        colors: {
            background: '#272822',
            primary: '#a6e22e',
            secondary: '#66d9ef',
            accent: '#f92672',
            text: '#f8f8f2',
            textDim: '#75715e',
            success: '#a6e22e',
            warning: '#e6db74',
            error: '#f92672',
            border: '#49483e'
        }
    },
    {
        id: 'dracula',
        name: 'Dracula',
        colors: {
            background: '#282a36',
            primary: '#8be9fd',
            secondary: '#bd93f9',
            accent: '#ff79c6',
            text: '#f8f8f2',
            textDim: '#6272a4',
            success: '#50fa7b',
            warning: '#f1fa8c',
            error: '#ff5555',
            border: '#44475a'
        }
    },
    {
        id: 'nord',
        name: 'Nord',
        colors: {
            background: '#2e3440',
            primary: '#88c0d0',
            secondary: '#81a1c1',
            accent: '#b48ead',
            text: '#eceff4',
            textDim: '#4c566a',
            success: '#a3be8c',
            warning: '#ebcb8b',
            error: '#bf616a',
            border: '#3b4252'
        }
    },
    {
        id: 'solarized_dark',
        name: 'Solarized Dark',
        colors: {
            background: '#002b36',
            primary: '#2aa198',
            secondary: '#268bd2',
            accent: '#b58900',
            text: '#839496',
            textDim: '#586e75',
            success: '#859900',
            warning: '#cb4b16',
            error: '#dc322f',
            border: '#073642'
        }
    }
];

// 主题状态
interface ThemeSystemState {
    currentThemeId: string;
    customTheme: Theme | null;
}

// 初始化主题系统
export function initThemeSystem(): ThemeSystemState {
    const saved = localStorage.getItem('theme_system');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        currentThemeId: 'vscode_dark',
        customTheme: null
    };
}

// 保存主题系统状态
export function saveThemeSystem(state: ThemeSystemState): void {
    localStorage.setItem('theme_system', JSON.stringify(state));
}

// 获取当前主题
export function getCurrentTheme(state: ThemeSystemState): Theme {
    if (state.customTheme) {
        return state.customTheme;
    }
    return PRESET_THEMES.find(t => t.id === state.currentThemeId) || PRESET_THEMES[0];
}

// 应用主题到页面
export function applyTheme(theme: Theme): void {
    const root = document.documentElement;
    
    root.style.setProperty('--bg-color', theme.colors.background);
    root.style.setProperty('--primary-color', theme.colors.primary);
    root.style.setProperty('--secondary-color', theme.colors.secondary);
    root.style.setProperty('--accent-color', theme.colors.accent);
    root.style.setProperty('--text-color', theme.colors.text);
    root.style.setProperty('--text-dim-color', theme.colors.textDim);
    root.style.setProperty('--success-color', theme.colors.success);
    root.style.setProperty('--warning-color', theme.colors.warning);
    root.style.setProperty('--error-color', theme.colors.error);
    root.style.setProperty('--border-color', theme.colors.border);
    
    document.body.style.background = theme.colors.background;
}

// 切换主题
export function switchTheme(state: ThemeSystemState, themeId: string): void {
    state.currentThemeId = themeId;
    state.customTheme = null; // 切换预设主题时清除自定义主题
    const theme = getCurrentTheme(state);
    applyTheme(theme);
    saveThemeSystem(state);
}

// 创建自定义主题
export function createCustomTheme(state: ThemeSystemState, colors: Theme['colors']): void {
    state.customTheme = {
        id: 'custom',
        name: '自定义主题',
        colors
    };
    state.currentThemeId = 'custom';
    applyTheme(state.customTheme);
    saveThemeSystem(state);
}

// 初始化主题UI面板
export function initThemeUI(state: ThemeSystemState): void {
    // 在右上角添加主题按钮
    const header = document.getElementById('header');
    if (!header) return;
    
    const buttonContainer = header.querySelector('div[style*="position: absolute"]') as HTMLElement;
    if (buttonContainer) {
        const themeBtn = document.createElement('button');
        themeBtn.id = 'theme-btn';
        themeBtn.style.cssText = 'background: #3e3e42; color: #d4d4d4; border: 1px solid #555; padding: 5px 12px; cursor: pointer; font-family: "Consolas", monospace; font-size: 12px;';
        themeBtn.innerHTML = '🎨 Theme';
        themeBtn.onclick = () => showThemePanel(state);
        buttonContainer.insertBefore(themeBtn, buttonContainer.firstChild);
    }
}

// 显示主题选择面板
function showThemePanel(state: ThemeSystemState): void {
    const panel = document.createElement('div');
    panel.id = 'theme-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1e1e1e;
        border: 2px solid #4ec9b0;
        border-radius: 8px;
        padding: 25px;
        width: 500px;
        max-height: 70vh;
        overflow-y: auto;
        z-index: 3000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        font-family: 'Consolas', monospace;
    `;
    
    const currentTheme = getCurrentTheme(state);
    
    panel.innerHTML = `
        <h3 style="margin-top: 0; color: #4ec9b0;">🎨 主题设置</h3>
        
        <div style="margin-bottom: 20px;">
            <h4 style="color: #d4d4d4; font-size: 14px; margin-bottom: 10px;">预设主题</h4>
            ${PRESET_THEMES.map(theme => `
                <div onclick="selectTheme('${theme.id}')" style="
                    padding: 12px;
                    margin-bottom: 8px;
                    background: ${theme.colors.background};
                    border: 2px solid ${state.currentThemeId === theme.id && !state.customTheme ? theme.colors.primary : theme.colors.border};
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.2s;
                " onmouseover="this.style.borderColor='${theme.colors.primary}'" onmouseout="this.style.borderColor='${state.currentThemeId === theme.id && !state.customTheme ? theme.colors.primary : theme.colors.border}'">
                    <div style="color: ${theme.colors.text}; font-weight: bold; margin-bottom: 5px;">${theme.name}</div>
                    <div style="display: flex; gap: 5px;">
                        <div style="width: 20px; height: 20px; background: ${theme.colors.primary}; border-radius: 2px;"></div>
                        <div style="width: 20px; height: 20px; background: ${theme.colors.secondary}; border-radius: 2px;"></div>
                        <div style="width: 20px; height: 20px; background: ${theme.colors.accent}; border-radius: 2px;"></div>
                        <div style="width: 20px; height: 20px; background: ${theme.colors.success}; border-radius: 2px;"></div>
                        <div style="width: 20px; height: 20px; background: ${theme.colors.error}; border-radius: 2px;"></div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4 style="color: #d4d4d4; font-size: 14px; margin-bottom: 10px;">自定义主题</h4>
            <div style="background: #2d2d30; padding: 15px; border-radius: 4px;">
                <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; align-items: center;">
                    <label style="color: #d4d4d4; font-size: 12px;">主色调:</label>
                    <input type="color" id="custom-primary" value="${currentTheme.colors.primary}" style="width: 100%; height: 30px; cursor: pointer;">
                    
                    <label style="color: #d4d4d4; font-size: 12px;">次要色:</label>
                    <input type="color" id="custom-secondary" value="${currentTheme.colors.secondary}" style="width: 100%; height: 30px; cursor: pointer;">
                    
                    <label style="color: #d4d4d4; font-size: 12px;">强调色:</label>
                    <input type="color" id="custom-accent" value="${currentTheme.colors.accent}" style="width: 100%; height: 30px; cursor: pointer;">
                    
                    <label style="color: #d4d4d4; font-size: 12px;">背景色:</label>
                    <input type="color" id="custom-background" value="${currentTheme.colors.background}" style="width: 100%; height: 30px; cursor: pointer;">
                </div>
                <button onclick="applyCustomTheme()" style="width: 100%; margin-top: 15px; padding: 8px; background: #4ec9b0; color: #1e1e1e; border: none; cursor: pointer; font-weight: bold; border-radius: 4px;">
                    应用自定义主题
                </button>
            </div>
        </div>
        
        <div style="text-align: right;">
            <button onclick="closeThemePanel()" style="background: #3e3e42; color: #d4d4d4; border: 1px solid #555; padding: 8px 16px; cursor: pointer;">关闭</button>
        </div>
    `;
    
    document.body.appendChild(panel);
}

// 绑定全局函数
(window as any).selectTheme = (themeId: string) => {
    const state = initThemeSystem();
    switchTheme(state, themeId);
    closeThemePanel();
};

(window as any).applyCustomTheme = () => {
    const state = initThemeSystem();
    const colors = {
        primary: (document.getElementById('custom-primary') as HTMLInputElement).value,
        secondary: (document.getElementById('custom-secondary') as HTMLInputElement).value,
        accent: (document.getElementById('custom-accent') as HTMLInputElement).value,
        background: (document.getElementById('custom-background') as HTMLInputElement).value,
        text: '#d4d4d4',
        textDim: '#888',
        success: '#6a9955',
        warning: '#ce9178',
        error: '#f44747',
        border: '#555'
    };
    createCustomTheme(state, colors);
    closeThemePanel();
};

(window as any).closeThemePanel = () => {
    const panel = document.getElementById('theme-panel');
    if (panel) panel.remove();
};

function closeThemePanel(): void {
    const panel = document.getElementById('theme-panel');
    if (panel) panel.remove();
}
