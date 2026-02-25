// --- 挑战模式系统模块 ---
import { soundEffects } from './soundEffects';

// 挑战模式类型
export type ChallengeMode = 'normal' | 'timeAttack' | 'survival' | 'zen';

// 挑战模式状态
let currentChallengeMode: ChallengeMode = 'normal';
let zenSpeedMultiplier: number = 1.5; // 禅意模式的速度倍率

// 获取当前挑战模式
export function getCurrentChallengeMode(): ChallengeMode {
    return currentChallengeMode;
}

// 设置挑战模式
export function setChallengeMode(mode: ChallengeMode): void {
    currentChallengeMode = mode;
}

// 获取禅意模式速度倍率
export function getZenSpeedMultiplier(): number {
    return zenSpeedMultiplier;
}

// 设置禅意模式速度倍率
export function setZenSpeedMultiplier(multiplier: number): void {
    zenSpeedMultiplier = Math.round(multiplier * 10) / 10; // 精确到小数点后一位
}

// 获取模式配置
export function getModeConfig(mode: ChallengeMode): { 
    name: string; 
    description: string; 
    spawnSpeedMultiplier: number; 
    fallSpeedMultiplier: number; 
    missLimit: number | null; 
    timeLimit: number | null;
    enableTimer: boolean;
} {
    const configs = {
        normal: {
            name: '普通模式',
            description: '标准游戏模式，难度逐渐递增',
            spawnSpeedMultiplier: 1.0,
            fallSpeedMultiplier: 1.0,
            missLimit: null, // 由等级决定
            timeLimit: null,
            enableTimer: true
        },
        timeAttack: {
            name: '限时模式',
            description: '60秒挑战！代码生成和下落速度×2',
            spawnSpeedMultiplier: 2.0,
            fallSpeedMultiplier: 2.0,
            missLimit: null,
            timeLimit: 60,
            enableTimer: true
        },
        survival: {
            name: '生存模式',
            description: 'Miss超过5次即失败，难度逐渐递增',
            spawnSpeedMultiplier: 1.0,
            fallSpeedMultiplier: 1.0,
            missLimit: 5,
            timeLimit: null,
            enableTimer: true
        },
        zen: {
            name: '禅意模式',
            description: '无压力练习，可自由调整速度（1.0-5.0x）',
            spawnSpeedMultiplier: zenSpeedMultiplier,
            fallSpeedMultiplier: zenSpeedMultiplier,
            missLimit: null, // 无限制
            timeLimit: null,
            enableTimer: false // 不显示计时器
        }
    };
    
    // 动态更新禅意模式的速度
    if (mode === 'zen') {
        configs.zen.spawnSpeedMultiplier = zenSpeedMultiplier;
        configs.zen.fallSpeedMultiplier = zenSpeedMultiplier;
    }
    
    return configs[mode];
}

// 初始化挑战模式UI
export function initChallengeModeUI(): void {
    const header = document.getElementById('header');
    if (!header) return;
    
    const buttonContainer = header.querySelector('div[style*="position: absolute"]') as HTMLElement;
    if (buttonContainer) {
        const challengeBtn = document.createElement('button');
        challengeBtn.id = 'challenge-mode-btn';
        challengeBtn.style.cssText = 'background: #3e3e42; color: #d4d4d4; border: 1px solid #555; padding: 5px 12px; cursor: pointer; font-family: "Consolas", monospace; font-size: 12px;';
        challengeBtn.innerHTML = '🎯 Challenge: <span id="challenge-status">Normal</span>';
        challengeBtn.onclick = showChallengeModePanel;
        buttonContainer.insertBefore(challengeBtn, buttonContainer.firstChild);
    }
}

// 显示挑战模式选择面板
function showChallengeModePanel(): void {
    soundEffects.playButtonClick();
    
    const panel = document.createElement('div');
    panel.id = 'challenge-mode-panel';
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
        z-index: 3000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;
    
    panel.innerHTML = `
        <h3 style="margin-top: 0; color: #4ec9b0; font-family: 'Consolas', monospace;">🎯 Challenge Modes</h3>
        
        <div style="margin-bottom: 20px;">
            <!-- 普通模式 -->
            <div class="mode-option" data-mode="normal" style="padding: 15px; margin-bottom: 12px; background: ${currentChallengeMode === 'normal' ? '#2d2d30' : '#252526'}; border: 2px solid ${currentChallengeMode === 'normal' ? '#4ec9b0' : '#3e3e42'}; border-radius: 4px; cursor: pointer;">
                <div style="color: #d4d4d4; font-weight: bold; margin-bottom: 5px;">📝 普通模式</div>
                <div style="color: #888; font-size: 12px;">标准游戏模式，难度逐渐递增</div>
            </div>
            
            <!-- 限时模式 -->
            <div class="mode-option" data-mode="timeAttack" style="padding: 15px; margin-bottom: 12px; background: ${currentChallengeMode === 'timeAttack' ? '#2d2d30' : '#252526'}; border: 2px solid ${currentChallengeMode === 'timeAttack' ? '#4ec9b0' : '#3e3e42'}; border-radius: 4px; cursor: pointer;">
                <div style="color: #d4d4d4; font-weight: bold; margin-bottom: 5px;">⏱️ 限时模式</div>
                <div style="color: #888; font-size: 12px;">60秒挑战！代码生成和下落速度×2</div>
                <div style="color: #f44747; font-size: 11px; margin-top: 3px;">▸ 高强度 | 速度×2</div>
            </div>
            
            <!-- 生存模式 -->
            <div class="mode-option" data-mode="survival" style="padding: 15px; margin-bottom: 12px; background: ${currentChallengeMode === 'survival' ? '#2d2d30' : '#252526'}; border: 2px solid ${currentChallengeMode === 'survival' ? '#4ec9b0' : '#3e3e42'}; border-radius: 4px; cursor: pointer;">
                <div style="color: #d4d4d4; font-weight: bold; margin-bottom: 5px;">💀 生存模式</div>
                <div style="color: #888; font-size: 12px;">Miss超过5次即失败</div>
                <div style="color: #f44747; font-size: 11px; margin-top: 3px;">▸ 高风险 | Miss上限:5</div>
            </div>
            
            <!-- 禅意模式 -->
            <div class="mode-option" data-mode="zen" style="padding: 15px; margin-bottom: 12px; background: ${currentChallengeMode === 'zen' ? '#2d2d30' : '#252526'}; border: 2px solid ${currentChallengeMode === 'zen' ? '#4ec9b0' : '#3e3e42'}; border-radius: 4px; cursor: pointer;">
                <div style="color: #d4d4d4; font-weight: bold; margin-bottom: 5px;">🧘 禅意模式</div>
                <div style="color: #888; font-size: 12px;">无压力练习，无计时无失败</div>
                <div style="color: #4ec9b0; font-size: 11px; margin-top: 3px;">▸ 放松练习 | 可调速度</div>
                
                <!-- 速度调节（仅禅意模式显示） -->
                <div id="zen-speed-control" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #3e3e42; display: ${currentChallengeMode === 'zen' ? 'block' : 'none'};">
                    <label style="color: #4ec9b0; font-size: 12px; display: block; margin-bottom: 8px;">
                        速度倍率: <span id="zen-speed-value">${zenSpeedMultiplier.toFixed(1)}</span>x
                    </label>
                    <input type="range" id="zen-speed-slider" min="10" max="50" value="${zenSpeedMultiplier * 10}" 
                           style="width: 100%; cursor: pointer;">
                    <div style="display: flex; justify-content: space-between; color: #666; font-size: 10px; margin-top: 4px;">
                        <span>1.0x</span>
                        <span>5.0x</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button id="cancel-challenge-btn" style="background: #3e3e42; color: #d4d4d4; border: 1px solid #555; padding: 8px 16px; cursor: pointer;">取消</button>
            <button id="start-challenge-btn" style="background: #4ec9b0; color: #1e1e1e; border: none; padding: 8px 16px; cursor: pointer; font-weight: bold;">开始游戏</button>
        </div>
    `;
    
    document.body.appendChild(panel);
    
    // 绑定事件
    bindChallengeModeEvents(panel);
}

// 绑定挑战模式面板事件
function bindChallengeModeEvents(panel: HTMLElement): void {
    // 模式选择
    const modeOptions = panel.querySelectorAll('.mode-option');
    modeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const mode = (option as HTMLElement).dataset.mode as ChallengeMode;
            
            // 更新选中状态
            modeOptions.forEach(opt => {
                (opt as HTMLElement).style.background = '#252526';
                (opt as HTMLElement).style.borderColor = '#3e3e42';
            });
            (option as HTMLElement).style.background = '#2d2d30';
            (option as HTMLElement).style.borderColor = '#4ec9b0';
            
            // 显示/隐藏禅意模式速度控制
            const zenControl = panel.querySelector('#zen-speed-control') as HTMLElement;
            if (zenControl) {
                zenControl.style.display = mode === 'zen' ? 'block' : 'none';
            }
            
            currentChallengeMode = mode;
            soundEffects.playButtonClick();
        });
    });
    
    // 禅意模式速度滑块
    const zenSlider = panel.querySelector('#zen-speed-slider') as HTMLInputElement;
    const zenSpeedValue = panel.querySelector('#zen-speed-value') as HTMLElement;
    
    if (zenSlider && zenSpeedValue) {
        zenSlider.addEventListener('input', () => {
            const value = parseFloat(zenSlider.value) / 10;
            zenSpeedMultiplier = Math.round(value * 10) / 10;
            zenSpeedValue.innerText = zenSpeedMultiplier.toFixed(1);
        });
    }
    
    // 取消按钮
    const cancelBtn = panel.querySelector('#cancel-challenge-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            soundEffects.playButtonClick();
            panel.remove();
        });
    }
    
    // 开始按钮
    const startBtn = panel.querySelector('#start-challenge-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            soundEffects.playButtonClick();
            panel.remove();
            
            // 更新UI显示
            updateChallengeModeStatus();
            
            // 重启游戏应用新模式
            location.reload();
        });
    }
}

// 更新挑战模式状态显示
function updateChallengeModeStatus(): void {
    const statusSpan = document.getElementById('challenge-status');
    if (!statusSpan) return;
    
    const modeNames = {
        normal: 'Normal',
        timeAttack: 'Time Attack',
        survival: 'Survival',
        zen: 'Zen'
    };
    
    statusSpan.innerText = modeNames[currentChallengeMode];
    statusSpan.style.color = currentChallengeMode === 'normal' ? '#d4d4d4' : '#4ec9b0';
}

// 检查是否应该游戏结束（根据模式规则）
export function shouldGameOver(
    missedCount: number, 
    seconds: number, 
    level: number, 
    getMaxMisses: (level: number) => number
): boolean {
    const config = getModeConfig(currentChallengeMode);
    
    // 限时模式：时间到了
    if (config.timeLimit !== null && seconds >= config.timeLimit) {
        return true;
    }
    
    // 生存模式：Miss超过固定上限
    if (config.missLimit !== null && missedCount >= config.missLimit) {
        return true;
    }
    
    // 普通模式：使用等级相关的Miss上限
    if (currentChallengeMode === 'normal' && missedCount >= getMaxMisses(level)) {
        return true;
    }
    
    // 禅意模式：永不失败
    if (currentChallengeMode === 'zen') {
        return false;
    }
    
    return false;
}

// 获取代码生成间隔（毫秒）
export function getSnippetSpawnInterval(baseInterval: number): number {
    const config = getModeConfig(currentChallengeMode);
    return baseInterval / config.spawnSpeedMultiplier;
}

// 获取代码下落速度倍率
export function getFallSpeedMultiplier(): number {
    const config = getModeConfig(currentChallengeMode);
    return config.fallSpeedMultiplier;
}

// 是否显示计时器
export function shouldShowTimer(): boolean {
    const config = getModeConfig(currentChallengeMode);
    return config.enableTimer;
}

// 获取剩余时间（限时模式专用）
export function getRemainingTime(seconds: number): number | null {
    const config = getModeConfig(currentChallengeMode);
    if (config.timeLimit === null) return null;
    return Math.max(0, config.timeLimit - seconds);
}

// 保存模式设置到 localStorage
export function saveChallengeMode(): void {
    try {
        localStorage.setItem('sys_diag_challenge_mode', currentChallengeMode);
        localStorage.setItem('sys_diag_zen_speed', zenSpeedMultiplier.toString());
    } catch (e) {
        console.error('Failed to save challenge mode:', e);
    }
}

// 加载模式设置
export function loadChallengeMode(): void {
    try {
        const savedMode = localStorage.getItem('sys_diag_challenge_mode');
        if (savedMode && ['normal', 'timeAttack', 'survival', 'zen'].includes(savedMode)) {
            currentChallengeMode = savedMode as ChallengeMode;
        }
        
        const savedSpeed = localStorage.getItem('sys_diag_zen_speed');
        if (savedSpeed) {
            const speed = parseFloat(savedSpeed);
            if (speed >= 1.0 && speed <= 5.0) {
                zenSpeedMultiplier = speed;
            }
        }
        
        // 更新UI
        updateChallengeModeStatus();
    } catch (e) {
        console.error('Failed to load challenge mode:', e);
    }
}

// 重置到普通模式
export function resetToNormalMode(): void {
    currentChallengeMode = 'normal';
    zenSpeedMultiplier = 1.5;
    saveChallengeMode();
    updateChallengeModeStatus();
}

// 是否为计分模式（禅意模式不计分）
export function isRankedMode(): boolean {
    return currentChallengeMode !== 'zen';
}

// 获取模式显示名称
export function getModeName(): string {
    const modeNames = {
        normal: '普通',
        timeAttack: '限时',
        survival: '生存',
        zen: '禅意'
    };
    return modeNames[currentChallengeMode];
}