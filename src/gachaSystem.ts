// --- 编译逻辑与掉落机制 (Gacha & Rarity) ---

import { soundEffects } from './soundEffects';
import { ITEMS, type ItemRarity, getRarityColor, getRarityName, addItem, type ItemSystemState } from './itemSystem';
import type { DailyTaskState } from './dailyTasks';

// 源码包（可编译的物品）
export interface SourcePackage {
    id: string;
    rarity: ItemRarity;
    name: string;
}

// Gacha系统状态
export interface GachaSystemState {
    packages: SourcePackage[]; // 拥有的源码包
    pity: { [rarity: string]: number }; // 保底计数
    compiling: boolean; // 是否正在编译
}

// 成功率配置
const SUCCESS_RATES: Record<ItemRarity, number> = {
    'Stable': 1.0,      // 100%
    'Beta': 0.8,        // 80%
    'RC': 0.5,          // 50%
    'Enterprise': 0.15, // 15%
    'Legacy': 0.02      // 2%
};

// 保底机制
const PITY_THRESHOLD: Record<ItemRarity, number> = {
    'Stable': 1,
    'Beta': 5,
    'RC': 10,
    'Enterprise': 30,
    'Legacy': 50
};

// 初始化Gacha状态
export function initGachaState(): GachaSystemState {
    const saved = localStorage.getItem('awdms_gacha');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        packages: [],
        pity: { 'Enterprise': 0, 'Legacy': 0 },
        compiling: false
    };
}

// 保存Gacha状态
export function saveGachaState(state: GachaSystemState): void {
    localStorage.setItem('awdms_gacha', JSON.stringify(state));
}

// 添加源码包（任务奖励）
export function addSourcePackage(state: GachaSystemState, rarity: ItemRarity): void {
    const pkg: SourcePackage = {
        id: `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        rarity,
        name: `Source Package [${getRarityName(rarity)}]`
    };
    state.packages.push(pkg);
    saveGachaState(state);
    
    showPackageObtainedNotification(pkg);
}

// 显示源码包获得通知
function showPackageObtainedNotification(pkg: SourcePackage): void {
    soundEffects.playAchievement();
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2d2d30;
        border: 2px solid ${getRarityColor(pkg.rarity)};
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 9999;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        font-family: 'Consolas', monospace;
    `;
    notification.innerHTML = `
        <div style="color: #4ec9b0; font-weight: bold; margin-bottom: 5px;">📦 Package Obtained</div>
        <div style="color: ${getRarityColor(pkg.rarity)}; font-size: 13px;">${pkg.name}</div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// 编译模块（消耗$COMMITS）
export async function compilePackage(
    gachaState: GachaSystemState,
    taskState: DailyTaskState,
    itemState: ItemSystemState,
    packageId: string,
    cost: number = 100
): Promise<{ success: boolean; item?: string; message: string }> {
    
    // 检查是否有足够的$COMMITS
    if (taskState.totalCommits < cost) {
        return { success: false, message: '算力积分不足' };
    }
    
    // 查找源码包
    const pkgIndex = gachaState.packages.findIndex(p => p.id === packageId);
    if (pkgIndex === -1) {
        return { success: false, message: '源码包不存在' };
    }
    
    const pkg = gachaState.packages[pkgIndex];
    
    // 扣除$COMMITS
    taskState.totalCommits -= cost;
    
    // 显示编译进度
    gachaState.compiling = true;
    saveGachaState(gachaState);
    showCompilingProgress();
    
    // 模拟编译时间
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 计算编译成功率
    const baseRate = SUCCESS_RATES[pkg.rarity];
    const pityCount = gachaState.pity[pkg.rarity] || 0;
    const pityThreshold = PITY_THRESHOLD[pkg.rarity];
    
    let success = false;
    
    // 保底机制
    if (pityCount >= pityThreshold - 1) {
        success = true; // 触发保底
        gachaState.pity[pkg.rarity] = 0;
    } else {
        success = Math.random() < baseRate;
        if (success) {
            gachaState.pity[pkg.rarity] = 0;
        } else {
            gachaState.pity[pkg.rarity] = pityCount + 1;
        }
    }
    
    gachaState.compiling = false;
    
    if (success) {
        // 编译成功，获得道具
        const item = ITEMS.find(i => i.rarity === pkg.rarity);
        if (item) {
            addItem(itemState, item.id);
            gachaState.packages.splice(pkgIndex, 1); // 移除已使用的元码包
            saveGachaState(gachaState);
            hideCompilingProgress();
            return { success: true, item: item.id, message: `编译成功！获得 ${item.name}` };
        }
    }
    
    // 编译失败
    gachaState.packages.splice(pkgIndex, 1);
    saveGachaState(gachaState);
    hideCompilingProgress();
    
    const pityInfo = gachaState.pity[pkg.rarity] > 0 
        ? `(保底进度: ${gachaState.pity[pkg.rarity]}/${pityThreshold})` 
        : '';
    return { success: false, message: `编译失败 ${pityInfo}` };
}

// 显示编译进度
function showCompilingProgress(): void {
    const progress = document.createElement('div');
    progress.id = 'compiling-progress';
    progress.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1e1e1e;
        border: 2px solid #4ec9b0;
        padding: 30px;
        border-radius: 8px;
        z-index: 9999;
        text-align: center;
        font-family: 'Consolas', monospace;
    `;
    progress.innerHTML = `
        <div style="color: #4ec9b0; font-size: 18px; margin-bottom: 15px;">⚙️ Module Compiling...</div>
        <div class="loading-bar" style="width: 200px; height: 4px; background: #3e3e42; border-radius: 2px; overflow: hidden;">
            <div style="width: 100%; height: 100%; background: #4ec9b0; animation: loading 2s ease-in-out;"></div>
        </div>
    `;
    
    // 添加加载动画CSS
    if (!document.getElementById('loading-animation-style')) {
        const style = document.createElement('style');
        style.id = 'loading-animation-style';
        style.textContent = `
            @keyframes loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(progress);
}

// 隐藏编译进度
function hideCompilingProgress(): void {
    const progress = document.getElementById('compiling-progress');
    if (progress) progress.remove();
}
