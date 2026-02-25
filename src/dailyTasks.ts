// --- 每日任务系统：Sprint Tickets ---

import { soundEffects } from './soundEffects';

// 任务定义
export interface DailyTask {
    id: string;
    name: string;
    tier: 'Junior' | 'Senior' | 'Architect' | 'Principal';
    description: string;
    requirement: (stats: TaskStats) => boolean;
    reward: number; // $COMMITS
    progress: (stats: TaskStats) => number; // 0-100%
}

// 任务统计数据
export interface TaskStats {
    charsTyped: number;
    uptime: number; // 秒
    burst10s: number; // 10秒内最大输入
    bossKeyUsedInLast10Min: boolean;
    nightChars: number; // 22:00-04:00输入
    stableWPM: boolean; // 1分钟稳定WPM
    lastBurst10sTime: number;
}

// 任务定义列表
export const DAILY_TASKS: DailyTask[] = [
    // Tier: Junior
    {
        id: 'refactor_legacy',
        name: 'Refactor Legacy Code',
        tier: 'Junior',
        description: '累计输入字符达到 2000 个',
        requirement: (stats) => stats.charsTyped >= 2000,
        progress: (stats) => Math.min(100, (stats.charsTyped / 2000) * 100),
        reward: 50
    },
    {
        id: 'uptime_monitoring',
        name: 'Uptime Monitoring',
        tier: 'Junior',
        description: '网页持续保持活动状态 60 分钟',
        requirement: (stats) => stats.uptime >= 3600,
        progress: (stats) => Math.min(100, (stats.uptime / 3600) * 100),
        reward: 50
    },
    // Tier: Senior
    {
        id: 'hotfix_pressure',
        name: 'Hotfix Under Pressure',
        tier: 'Senior',
        description: '10秒内爆发输入 100 字符',
        requirement: (stats) => stats.burst10s >= 100,
        progress: (stats) => Math.min(100, (stats.burst10s / 100) * 100),
        reward: 100
    },
    // Tier: Architect
    {
        id: 'stress_resistance',
        name: 'Stress Resistance',
        tier: 'Architect',
        description: '10分钟内不启用紧急避险键',
        requirement: (stats) => !stats.bossKeyUsedInLast10Min,
        progress: (stats) => stats.bossKeyUsedInLast10Min ? 0 : 100,
        reward: 150
    },
    {
        id: 'nightly_build',
        name: 'Nightly Build',
        tier: 'Architect',
        description: '在 22:00 至 04:00 之间完成 500 字符输入',
        requirement: (stats) => stats.nightChars >= 500,
        progress: (stats) => Math.min(100, (stats.nightChars / 500) * 100),
        reward: 150
    },
    // Tier: Principal
    {
        id: 'zero_bug',
        name: 'Zero-Bug Delivery',
        tier: 'Principal',
        description: '连续 1 分钟保持稳定的 WPM 输入区间',
        requirement: (stats) => stats.stableWPM,
        progress: (stats) => stats.stableWPM ? 100 : 0,
        reward: 200
    }
];

// 每日任务状态
export interface DailyTaskState {
    tasks: { [taskId: string]: { completed: boolean; claimed: boolean } };
    stats: TaskStats;
    lastResetDate: string;
    totalCommits: number;
}

// 初始化任务状态
export function initDailyTaskState(): DailyTaskState {
    const saved = localStorage.getItem('awdms_daily_tasks');
    if (saved) {
        const state = JSON.parse(saved);
        // 检查是否需要重置（每日00:00）
        const today = new Date().toDateString();
        if (state.lastResetDate !== today) {
            return resetDailyTasks(state.totalCommits);
        }
        return state;
    }
    return resetDailyTasks(0);
}

// 重置每日任务
function resetDailyTasks(commitBalance: number): DailyTaskState {
    const tasks: any = {};
    DAILY_TASKS.forEach(task => {
        tasks[task.id] = { completed: false, claimed: false };
    });
    
    return {
        tasks,
        stats: {
            charsTyped: 0,
            uptime: 0,
            burst10s: 0,
            bossKeyUsedInLast10Min: false,
            nightChars: 0,
            stableWPM: false,
            lastBurst10sTime: 0
        },
        lastResetDate: new Date().toDateString(),
        totalCommits: commitBalance
    };
}

// 保存任务状态
export function saveDailyTaskState(state: DailyTaskState): void {
    localStorage.setItem('awdms_daily_tasks', JSON.stringify(state));
}

// 更新统计
export function updateTaskStats(state: DailyTaskState, type: string, value?: any): void {
    const now = Date.now();
    const hour = new Date().getHours();
    
    switch (type) {
        case 'char':
            state.stats.charsTyped++;
            // 夜间输入统计
            if (hour >= 22 || hour < 4) {
                state.stats.nightChars++;
            }
            break;
        case 'uptime':
            state.stats.uptime++;
            break;
        case 'burst':
            if (value > state.stats.burst10s) {
                state.stats.burst10s = value;
                state.stats.lastBurst10sTime = now;
            }
            break;
        case 'bossKey':
            state.stats.bossKeyUsedInLast10Min = true;
            // 10分钟后重置
            setTimeout(() => {
                state.stats.bossKeyUsedInLast10Min = false;
            }, 600000);
            break;
        case 'stableWPM':
            state.stats.stableWPM = value;
            break;
    }
    
    // 检查任务完成
    checkTaskCompletion(state);
    saveDailyTaskState(state);
}

// 检查任务完成
function checkTaskCompletion(state: DailyTaskState): void {
    DAILY_TASKS.forEach(task => {
        const taskState = state.tasks[task.id];
        if (!taskState.completed && task.requirement(state.stats)) {
            taskState.completed = true;
            showTaskCompletedNotification(task);
        }
    });
}

// 显示任务完成通知
function showTaskCompletedNotification(task: DailyTask): void {
    soundEffects.playAchievement();
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2d2d30;
        border: 2px solid #4ec9b0;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        font-family: 'Consolas', monospace;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <div style="color: #4ec9b0; font-weight: bold; margin-bottom: 5px;">✅ Task Completed</div>
        <div style="color: #d4d4d4; font-size: 13px;">${task.name}</div>
        <div style="color: #dcdcaa; font-size: 12px; margin-top: 5px;">Reward: +${task.reward} $COMMITS</div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// 领取任务奖励
export function claimTaskReward(state: DailyTaskState, taskId: string): boolean {
    const taskState = state.tasks[taskId];
    const task = DAILY_TASKS.find(t => t.id === taskId);
    
    if (!task || !taskState.completed || taskState.claimed) {
        return false;
    }
    
    taskState.claimed = true;
    state.totalCommits += task.reward;
    saveDailyTaskState(state);
    soundEffects.playSaveSettings();
    return true;
}

// 获取可领取的奖励总数
export function getClaimableRewards(state: DailyTaskState): number {
    return DAILY_TASKS.reduce((sum, task) => {
        const taskState = state.tasks[task.id];
        return sum + (taskState.completed && !taskState.claimed ? task.reward : 0);
    }, 0);
}
