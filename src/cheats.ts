// --- 作弊系统模块 ---
import { soundEffects } from './soundEffects';

// 作弊状态变量
let inputBuffer = '';
export let cheatWallActive = false;
export let cheatMoneyTimer: any = null;

// 获取作弊状态的函数
export function isWallCheatActive(): boolean {
    return cheatWallActive;
}

// 激活作弊码
function activateCheat(text: string): void {
    showCheatMsg(text);
    // 特效：全屏闪烁一下绿色
    document.body.style.boxShadow = 'inset 0 0 50px #6a9955';
    setTimeout(() => { document.body.style.boxShadow = 'none'; }, 500);
}

// 显示作弊信息
function showCheatMsg(text: string): void {
    const cheatMsg = document.getElementById('cheat-msg');
    if (cheatMsg) {
        cheatMsg.innerText = `[ SYSTEM OVERRIDE: ${text} ]`;
        cheatMsg.style.display = 'block';
        setTimeout(() => { cheatMsg.style.display = 'none'; }, 3000);
    }
}

// 检测作弊码
export function checkCheats(
    key: string,
    achievementData: any,
    ACHIEVEMENT_STORE: any,
    checkAndUnlockAchievement: (id: string, notify: boolean) => void,
    addScore: (amount: number, x?: number, y?: number) => void,
    showFloatScore: (x: number, y: number, amount: number, combo?: number) => void,
    isBossMode: boolean,
    isGameOver: boolean,
    setGlobalSpeedMultiplier: (multiplier: number) => void,
    getGlobalSpeedMultiplier: () => number
): void {
    if (key.length !== 1) return;
    
    inputBuffer += key.toLowerCase();
    if (inputBuffer.length > 50) inputBuffer = inputBuffer.slice(-50);

    // Cheat 1: black sheep wall (2分钟无敌)
    if (inputBuffer.endsWith('black sheep wall')) {
        activateCheat('WALL HACK: INVINCIBLE (2m)');
        soundEffects.playCheatActivated();
        cheatWallActive = true;
        setTimeout(() => {
            cheatWallActive = false;
            showCheatMsg('WALL HACK EXPIRED');
        }, 120000);
        inputBuffer = '';
    }

    // Cheat 2: show me money (1分钟自动加分)
    if (inputBuffer.endsWith('show me money')) {
        activateCheat('MONEY HACK: AUTO-FARM (1m)');
        soundEffects.playCheatActivated();
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
        setGlobalSpeedMultiplier(getGlobalSpeedMultiplier() * 0.8);
        inputBuffer = '';
    }
}

// 重置作弊状态
export function resetCheats(): void {
    if (cheatMoneyTimer) {
        clearInterval(cheatMoneyTimer);
        cheatMoneyTimer = null;
    }
    cheatWallActive = false;
    inputBuffer = '';
}
