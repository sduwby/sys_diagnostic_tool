// --- 特殊道具系统：Core Dependencies ---

import { soundEffects } from './soundEffects';
import type { DailyTaskState } from './dailyTasks';

// 稀有度定义
export type ItemRarity = 'Stable' | 'Beta' | 'RC' | 'Enterprise' | 'Legacy';

// 道具定义
export interface Item {
    id: string;
    name: string;
    rarity: ItemRarity;
    description: string;
    effect: (state: ItemSystemState) => void; // 道具效果
    icon: string;
}

// 道具系统状态
export interface ItemSystemState {
    ownedItems: string[]; // 拥有的道具ID列表
    activeItems: string[]; // 激活的道具ID列表
    missCount: number; // 当前Miss计数（用于判断deep-seek-ai条件）
    lastMissTime: number;
}

// 道具列表
export const ITEMS: Item[] = [
    {
        id: 'lodash_mini',
        name: 'lodash-mini',
        rarity: 'Stable',
        description: '优化数组处理，按键基础积分 +2',
        effect: (state) => {
            // 实际效果在 app.ts 中的 addScore 里实现
        },
        icon: '📦'
    },
    {
        id: 'auto_prettier',
        name: 'auto-prettier',
        rarity: 'Stable',
        description: '每秒自动产生 5 次虚拟敲击',
        effect: (state) => {
            // 每秒触发5次虚拟点击
        },
        icon: '📦'
    },
    {
        id: 'react_lazy_load',
        name: 'react-lazy-load',
        rarity: 'Beta',
        description: '失去焦点时，积分累加不中断',
        effect: (state) => {
            // 窗口失焦时继续计算积分
        },
        icon: '📘'
    },
    {
        id: 'proxy_tunnel',
        name: 'proxy-tunnel',
        rarity: 'RC',
        description: '缩短紧急避险后的冷却时间 (CD)',
        effect: (state) => {
            // Boss键冷却时间减少
        },
        icon: '🔧'
    },
    {
        id: 'k8s_autoscale',
        name: 'k8s-autoscale',
        rarity: 'Enterprise',
        description: '动态倍率，根据敲击频率最高提供 5x 奖励',
        effect: (state) => {
            // 根据点击频率动态调整倍率
        },
        icon: '⚡'
    },
    {
        id: 'deep_seek_ai',
        name: 'deep-seek-ai',
        rarity: 'Legacy',
        description: 'AI 模拟人工轨迹，实现全自动积分获取（零Miss时有效）',
        effect: (state) => {
            // 只在 Miss=0 时自动加分
        },
        icon: '🤖'
    }
];

// 获取道具稀有度颜色
export function getRarityColor(rarity: ItemRarity): string {
    const colors: Record<ItemRarity, string> = {
        'Stable': '#888',
        'Beta': '#4ec9b0',
        'RC': '#569cd6',
        'Enterprise': '#c586c0',
        'Legacy': '#dcdcaa'
    };
    return colors[rarity];
}

// 获取道具稀有度中文名
export function getRarityName(rarity: ItemRarity): string {
    const names: Record<ItemRarity, string> = {
        'Stable': '普通',
        'Beta': '优秀',
        'RC': '精良',
        'Enterprise': '史诗',
        'Legacy': '传说'
    };
    return names[rarity];
}

// 初始化道具系统状态
export function initItemSystemState(): ItemSystemState {
    const saved = localStorage.getItem('awdms_items');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        ownedItems: [],
        activeItems: [],
        missCount: 0,
        lastMissTime: 0
    };
}

// 保存道具系统状态
export function saveItemSystemState(state: ItemSystemState): void {
    localStorage.setItem('awdms_items', JSON.stringify(state));
}

// 添加道具
export function addItem(state: ItemSystemState, itemId: string): void {
    if (!state.ownedItems.includes(itemId)) {
        state.ownedItems.push(itemId);
        saveItemSystemState(state);
        
        const item = ITEMS.find(i => i.id === itemId);
        if (item) {
            showItemObtainedNotification(item);
        }
    }
}

// 激活/停用道具
export function toggleItem(state: ItemSystemState, itemId: string): boolean {
    if (!state.ownedItems.includes(itemId)) return false;
    
    const index = state.activeItems.indexOf(itemId);
    if (index > -1) {
        state.activeItems.splice(index, 1);
    } else {
        state.activeItems.push(itemId);
    }
    
    saveItemSystemState(state);
    return true;
}

// 检查道具是否激活
export function isItemActive(state: ItemSystemState, itemId: string): boolean {
    return state.activeItems.includes(itemId);
}

// 显示道具获得通知
function showItemObtainedNotification(item: Item): void {
    soundEffects.playAchievement();
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #1e1e1e 0%, #2d2d30 100%);
        border: 3px solid ${getRarityColor(item.rarity)};
        padding: 30px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: 0 0 40px ${getRarityColor(item.rarity)}80;
        font-family: 'Consolas', monospace;
        animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        text-align: center;
        min-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 10px;">${item.icon}</div>
        <div style="color: ${getRarityColor(item.rarity)}; font-weight: bold; font-size: 16px; margin-bottom: 5px;">
            [${getRarityName(item.rarity)}]
        </div>
        <div style="color: #fff; font-size: 18px; margin-bottom: 10px;">${item.name}</div>
        <div style="color: #888; font-size: 12px;">${item.description}</div>
    `;
    
    document.body.appendChild(notification);
    
    // 添加弹出动画的CSS
    if (!document.getElementById('item-notification-style')) {
        const style = document.createElement('style');
        style.id = 'item-notification-style';
        style.textContent = `
            @keyframes popIn {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        notification.style.animation = 'popOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 计算道具加成的得分倍率
export function getItemScoreBonus(state: ItemSystemState): number {
    let bonus = 0;
    
    // lodash-mini: +2基础积分
    if (isItemActive(state, 'lodash_mini')) {
        bonus += 2;
    }
    
    return bonus;
}

// 计算道具加成的速度倍率（用于 k8s-autoscale）
export function getItemSpeedMultiplier(state: ItemSystemState, clickFrequency: number): number {
    if (!isItemActive(state, 'k8s_autoscale')) return 1.0;
    
    // 根据点击频率（每秒点击数）动态调整倍率
    // 假设正常速度是1-2次/秒，高频是5+次/秒
    if (clickFrequency >= 5) return 5.0;
    if (clickFrequency >= 3) return 3.0;
    if (clickFrequency >= 2) return 2.0;
    return 1.0;
}

// 检查是否应该触发 deep-seek-ai 自动加分
export function shouldTriggerAutoScore(state: ItemSystemState): boolean {
    return isItemActive(state, 'deep_seek_ai') && state.missCount === 0;
}

// 更新 Miss 计数
export function updateMissCount(state: ItemSystemState, increment: boolean): void {
    if (increment) {
        state.missCount++;
        state.lastMissTime = Date.now();
    } else {
        state.missCount = 0;
    }
    saveItemSystemState(state);
}
