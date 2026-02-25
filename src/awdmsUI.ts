// --- AWDMS界面伪装系统 ---

import { DAILY_TASKS, type DailyTaskState, claimTaskReward, getClaimableRewards } from './dailyTasks';
import { ITEMS, type ItemSystemState, isItemActive, toggleItem, getRarityColor, getRarityName } from './itemSystem';
import { type GachaSystemState, compilePackage, addSourcePackage } from './gachaSystem';
import { soundEffects } from './soundEffects';

// 初始化AWDMS UI
export function initAWDMSUI(
    taskState: DailyTaskState,
    itemState: ItemSystemState,
    gachaState: GachaSystemState
): void {
    // 创建顶部按钮
    createAWDMSButtons();
    
    // 绑定到window供HTML调用
    (window as any).openTaskPanel = () => openTaskPanel(taskState);
    (window as any).openInventory = () => openInventory(itemState);
    (window as any).openShop = () => openShop(taskState, gachaState, itemState);
    (window as any).closeAWDMSPanel = closeAWDMSPanel;
}

// 创建顶部按钮
function createAWDMSButtons(): void {
    const header = document.getElementById('header');
    if (!header) return;
    
    const buttonContainer = header.querySelector('div[style*="position: absolute"]') as HTMLElement;
    if (!buttonContainer) return;
    
    // Tasks按钮
    const tasksBtn = document.createElement('button');
    tasksBtn.id = 'awdms-tasks-btn';
    tasksBtn.style.cssText = 'background: #3e3e42; color: #d4d4d4; border: 1px solid #555; padding: 5px 12px; cursor: pointer; font-family: "Consolas", monospace; font-size: 12px; margin-right: 8px;';
    tasksBtn.innerHTML = '📋 Tasks';
    tasksBtn.onclick = () => (window as any).openTaskPanel();
    
    // Items按钮
    const itemsBtn = document.createElement('button');
    itemsBtn.id = 'awdms-items-btn';
    itemsBtn.style.cssText = 'background: #3e3e42; color: #d4d4d4; border: 1px solid #555; padding: 5px 12px; cursor: pointer; font-family: "Consolas", monospace; font-size: 12px; margin-right: 8px;';
    itemsBtn.innerHTML = '📦 Items';
    itemsBtn.onclick = () => (window as any).openInventory();
    
    // Shop按钮
    const shopBtn = document.createElement('button');
    shopBtn.id = 'awdms-shop-btn';
    shopBtn.style.cssText = 'background: #3e3e42; color: #d4d4d4; border: 1px solid #555; padding: 5px 12px; cursor: pointer; font-family: "Consolas", monospace; font-size: 12px; margin-right: 8px;';
    shopBtn.innerHTML = '🛒 Shop';
    shopBtn.onclick = () => (window as any).openShop();
    
    buttonContainer.insertBefore(shopBtn, buttonContainer.firstChild);
    buttonContainer.insertBefore(itemsBtn, buttonContainer.firstChild);
    buttonContainer.insertBefore(tasksBtn, buttonContainer.firstChild);
}

// 打开任务面板（TODO.md风格）
function openTaskPanel(taskState: DailyTaskState): void {
    soundEffects.playButtonClick();
    closeAWDMSPanel();
    
    const panel = document.createElement('div');
    panel.id = 'awdms-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1e1e1e;
        border: 2px solid #4ec9b0;
        border-radius: 8px;
        padding: 25px;
        width: 650px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        font-family: 'Consolas', monospace;
    `;
    
    const claimable = getClaimableRewards(taskState);
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #4ec9b0;">📋 Sprint Tickets - TODO.md</h3>
            <button onclick="closeAWDMSPanel()" style="background: transparent; border: none; color: #888; cursor: pointer; font-size: 20px;">✕</button>
        </div>
        
        <div style="background: #2d2d30; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <div style="color: #dcdcaa; font-size: 14px; margin-bottom: 5px;">💰 $COMMITS Balance: <span style="color: #fff; font-weight: bold;">${taskState.totalCommits}</span></div>
            <div style="color: #4ec9b0; font-size: 12px;">🎁 Claimable Rewards: <span style="color: #fff;">+${claimable}</span> $COMMITS</div>
        </div>
        
        <div style="color: #888; font-size: 12px; margin-bottom: 15px;">
            ## Daily Tasks (Reset: 00:00 Local Time)
        </div>
        
        <div id="task-list-container">
            ${renderTaskList(taskState)}
        </div>
    `;
    
    document.body.appendChild(panel);
}

// 渲染任务列表
function renderTaskList(taskState: DailyTaskState): string {
    return DAILY_TASKS.map(task => {
        const state = taskState.tasks[task.id];
        const progress = task.progress(taskState.stats);
        const completed = state.completed;
        const claimed = state.claimed;
        
        const statusIcon = claimed ? '✅' : completed ? '🎁' : '⏳';
        const statusColor = claimed ? '#888' : completed ? '#4ec9b0' : '#d4d4d4';
        
        const tierColors: Record<string, string> = {
            'Junior': '#888',
            'Senior': '#4ec9b0',
            'Architect': '#569cd6',
            'Principal': '#dcdcaa'
        };
        
        return `
            <div style="background: ${claimed ? '#2a2a2a' : '#2d2d30'}; padding: 15px; border-radius: 4px; margin-bottom: 10px; border-left: 3px solid ${tierColors[task.tier]};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div>
                        <span style="color: ${tierColors[task.tier]}; font-size: 11px; font-weight: bold;">[${task.tier}]</span>
                        <span style="color: ${statusColor}; font-weight: bold; margin-left: 8px;">${statusIcon} ${task.name}</span>
                    </div>
                    ${completed && !claimed ? `<button onclick="claimTask('${task.id}')" style="background: #4ec9b0; color: #1e1e1e; border: none; padding: 5px 12px; cursor: pointer; font-weight: bold; border-radius: 2px;">Claim +${task.reward}</button>` : ''}
                </div>
                <div style="color: #888; font-size: 12px; margin-bottom: 8px;">- ${task.description}</div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="flex: 1; height: 6px; background: #3e3e42; border-radius: 3px; overflow: hidden;">
                        <div style="width: ${progress}%; height: 100%; background: ${completed ? '#4ec9b0' : '#569cd6'}; transition: width 0.3s;"></div>
                    </div>
                    <span style="color: ${completed ? '#4ec9b0' : '#888'}; font-size: 11px; min-width: 45px;">${progress.toFixed(0)}%</span>
                </div>
            </div>
        `;
    }).join('');
}

// 打开道具背包（package.json风格）
function openInventory(itemState: ItemSystemState): void {
    soundEffects.playButtonClick();
    closeAWDMSPanel();
    
    const panel = document.createElement('div');
    panel.id = 'awdms-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1e1e1e;
        border: 2px solid #4ec9b0;
        border-radius: 8px;
        padding: 25px;
        width: 700px;
        max-height: 80vh;
        overflow-y: auto;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        font-family: 'Consolas', monospace;
    `;
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; color: #4ec9b0;">📦 Dependencies - package.json</h3>
            <button onclick="closeAWDMSPanel()" style="background: transparent; border: none; color: #888; cursor: pointer; font-size: 20px;">✕</button>
        </div>
        
        <div style="background: #2d2d30; padding: 15px; border-radius: 4px; margin-bottom: 20px; font-size: 13px;">
            <div style="color: #888;">{</div>
            <div style="color: #888; margin-left: 20px;">"dependencies": {</div>
            <div id="inventory-items-container" style="margin-left: 40px;">
                ${renderInventoryItems(itemState)}
            </div>
            <div style="color: #888; margin-left: 20px;">}</div>
            <div style="color: #888;">}</div>
        </div>
        
        ${itemState.ownedItems.length === 0 ? '<div style="color: #888; text-align: center; padding: 20px;">No dependencies installed yet. Complete tasks to obtain packages.</div>' : ''}
    `;
    
    document.body.appendChild(panel);
}

// 渲染背包道具
function renderInventoryItems(itemState: ItemSystemState): string {
    if (itemState.ownedItems.length === 0) return '';
    
    return ITEMS.filter(item => itemState.ownedItems.includes(item.id))
        .map((item, index, arr) => {
            const isActive = isItemActive(itemState, item.id);
            const comma = index < arr.length - 1 ? ',' : '';
            
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; cursor: pointer; transition: background 0.2s;" 
                     onmouseover="this.style.background='#3e3e42'" 
                     onmouseout="this.style.background='transparent'"
                     onclick="toggleItemActive('${item.id}')">
                    <div>
                        <span style="color: #ce9178;">"${item.name}"</span>: 
                        <span style="color: ${getRarityColor(item.rarity)};">"^${item.rarity.toLowerCase()}"</span>${comma}
                        ${isActive ? '<span style="color: #4ec9b0; margin-left: 10px;">● ACTIVE</span>' : '<span style="color: #888; margin-left: 10px;">○ Inactive</span>'}
                    </div>
                    <div style="color: #888; font-size: 11px;">${item.icon} ${item.description}</div>
                </div>
            `;
        }).join('');
}

// 打开商店（AWS控制台风格）
function openShop(taskState: DailyTaskState, gachaState: GachaSystemState, itemState: ItemSystemState): void {
    soundEffects.playButtonClick();
    closeAWDMSPanel();
    
    const panel = document.createElement('div');
    panel.id = 'awdms-panel';
    panel.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #1e1e1e;
        border: 2px solid #4ec9b0;
        border-radius: 8px;
        padding: 25px;
        width: 750px;
        max-height: 85vh;
        overflow-y: auto;
        z-index: 10000;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        font-family: 'Consolas', monospace;
    `;
    
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <div>
                <h3 style="margin: 0; color: #4ec9b0;">🛒 Module Compilation - AWS Control Panel</h3>
                <div style="color: #888; font-size: 11px; margin-top: 5px;">Region: cn-north-1 | Service: Lambda Functions</div>
            </div>
            <button onclick="closeAWDMSPanel()" style="background: transparent; border: none; color: #888; cursor: pointer; font-size: 20px;">✕</button>
        </div>
        
        <div style="background: #2d2d30; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
            <div style="color: #dcdcaa; font-size: 14px;">💰 $COMMITS Balance: <span style="color: #fff; font-weight: bold;">${taskState.totalCommits}</span></div>
            <div style="color: #888; font-size: 11px; margin-top: 5px;">Source Packages Available: ${gachaState.packages.length}</div>
        </div>
        
        <div style="margin-bottom: 20px;">
            <h4 style="color: #4ec9b0; font-size: 14px; margin-bottom: 10px;">📦 Source Packages (Pending Compilation)</h4>
            <div id="packages-container" style="max-height: 200px; overflow-y: auto;">
                ${gachaState.packages.length === 0 
                    ? '<div style="color: #888; text-align: center; padding: 20px; font-size: 12px;">No packages available. Complete tasks to obtain.</div>'
                    : renderPackagesList(gachaState, taskState, itemState)}
            </div>
        </div>
        
        <div style="border-top: 1px solid #3e3e42; padding-top: 20px;">
            <h4 style="color: #4ec9b0; font-size: 14px; margin-bottom: 10px;">💳 Monetization (Simulated - No Real Payment)</h4>
            <div style="background: #2d2d30; padding: 15px; border-radius: 4px;">
                <div style="color: #888; font-size: 12px; margin-bottom: 10px;">⚠️ Payment features are simulated for testing only</div>
                <button onclick="simulatePurchase('pro')" style="background: #569cd6; color: #fff; border: none; padding: 8px 16px; cursor: pointer; border-radius: 4px; margin-right: 10px; font-size: 12px;">
                    🌟 Activate Developer Pro
                </button>
                <button onclick="simulatePurchase('credits')" style="background: #dcdcaa; color: #1e1e1e; border: none; padding: 8px 16px; cursor: pointer; border-radius: 4px; font-size: 12px;">
                    💰 +1000 $COMMITS
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(panel);
}

// 渲染源码包列表
function renderPackagesList(gachaState: GachaSystemState, taskState: DailyTaskState, itemState: ItemSystemState): string {
    return gachaState.packages.map(pkg => {
        const cost = 100;
        const canAfford = taskState.totalCommits >= cost;
        
        return `
            <div style="background: #2d2d30; padding: 12px; border-radius: 4px; margin-bottom: 8px; border-left: 3px solid ${getRarityColor(pkg.rarity)};">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="color: ${getRarityColor(pkg.rarity)}; font-weight: bold;">[${getRarityName(pkg.rarity)}]</span>
                        <span style="color: #d4d4d4; margin-left: 10px;">${pkg.name}</span>
                    </div>
                    <button 
                        onclick="compilePackageFromUI('${pkg.id}')" 
                        ${!canAfford ? 'disabled' : ''}
                        style="background: ${canAfford ? '#4ec9b0' : '#3e3e42'}; color: ${canAfford ? '#1e1e1e' : '#555'}; border: none; padding: 6px 14px; cursor: ${canAfford ? 'pointer' : 'not-allowed'}; border-radius: 3px; font-size: 11px; font-weight: bold;">
                        ⚙️ Compile (-${cost})
                    </button>
                </div>
                ${gachaState.pity[pkg.rarity] > 0 ? `<div style="color: #dcdcaa; font-size: 10px; margin-top: 5px;">保底: ${gachaState.pity[pkg.rarity]}/${ITEMS.find(i => i.rarity === pkg.rarity) ? 50 : 30}</div>` : ''}
            </div>
        `;
    }).join('');
}

// 关闭所有AWDMS面板
function closeAWDMSPanel(): void {
    const panel = document.getElementById('awdms-panel');
    if (panel) panel.remove();
}

// 领取任务奖励（绑定到window）
export function setupTaskClaimHandler(taskState: DailyTaskState, gachaState: GachaSystemState): void {
    (window as any).claimTask = (taskId: string) => {
        const success = claimTaskReward(taskState, taskId);
        if (success) {
            // 给予源码包奖励（随机稀有度）
            const rarities: any[] = ['Stable', 'Stable', 'Beta', 'Beta', 'RC', 'Enterprise'];
            const randomRarity = rarities[Math.floor(Math.random() * rarities.length)];
            addSourcePackage(gachaState, randomRarity);
            
            // 刷新任务面板
            closeAWDMSPanel();
            setTimeout(() => openTaskPanel(taskState), 100);
        }
    };
}

// 道具激活切换（绑定到window）
export function setupItemToggleHandler(itemState: ItemSystemState): void {
    (window as any).toggleItemActive = (itemId: string) => {
        const success = toggleItem(itemState, itemId);
        if (success) {
            soundEffects.playButtonClick();
            // 刷新背包界面
            closeAWDMSPanel();
            setTimeout(() => openInventory(itemState), 50);
        }
    };
}

// 编译源码包（绑定到window）
export function setupCompileHandler(
    gachaState: GachaSystemState,
    taskState: DailyTaskState,
    itemState: ItemSystemState
): void {
    (window as any).compilePackageFromUI = async (packageId: string) => {
        const result = await compilePackage(gachaState, taskState, itemState, packageId, 100);
        
        // 显示结果通知
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${result.success ? '#2d2d30' : '#3e2020'};
            border: 2px solid ${result.success ? '#4ec9b0' : '#f44747'};
            padding: 15px 20px;
            border-radius: 4px;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
            font-family: 'Consolas', monospace;
        `;
        notification.innerHTML = `
            <div style="color: ${result.success ? '#4ec9b0' : '#f44747'}; font-weight: bold; margin-bottom: 5px;">
                ${result.success ? '✅ Compilation Success' : '❌ Compilation Failed'}
            </div>
            <div style="color: #d4d4d4; font-size: 13px;">${result.message}</div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
        
        // 刷新商店界面
        closeAWDMSPanel();
        setTimeout(() => openShop(taskState, gachaState, itemState), 100);
    };
}

// 模拟购买（绑定到window）
export function setupPurchaseHandler(taskState: DailyTaskState): void {
    (window as any).simulatePurchase = (type: string) => {
        soundEffects.playAchievement();
        
        if (type === 'pro') {
            // 模拟激活Pro（仅本地标记）
            localStorage.setItem('awdms_developer_pro', 'true');
            alert('✅ Developer Pro Activated (Simulated)\n\n每日任务奖励×2\n编译时间-50%');
        } else if (type === 'credits') {
            // 模拟购买积分
            taskState.totalCommits += 1000;
            alert('✅ Purchased 1000 $COMMITS (Simulated)');
        }
    };
}

// 显示$COMMITS余额指示器
export function createCommitsIndicator(taskState: DailyTaskState): void {
    const indicator = document.createElement('div');
    indicator.id = 'commits-indicator';
    indicator.style.cssText = `
        position: fixed;
        top: 60px;
        left: 20px;
        background: #2d2d30;
        border: 1px solid #4ec9b0;
        padding: 8px 12px;
        border-radius: 4px;
        font-family: 'Consolas', monospace;
        font-size: 12px;
        z-index: 1000;
    `;
    indicator.innerHTML = `
        <span style="color: #dcdcaa;">💰 $COMMITS:</span>
        <span id="commits-balance" style="color: #fff; font-weight: bold; margin-left: 5px;">${taskState.totalCommits}</span>
    `;
    document.body.appendChild(indicator);
}

// 更新$COMMITS显示
export function updateCommitsDisplay(taskState: DailyTaskState): void {
    const balanceEl = document.getElementById('commits-balance');
    if (balanceEl) {
        balanceEl.innerText = taskState.totalCommits.toString();
    }
}
