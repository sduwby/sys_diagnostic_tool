// --- 道具效果执行系统 ---

import type { ItemSystemState } from './itemSystem';
import { isItemActive } from './itemSystem';

// auto-prettier 效果：每秒自动5次虚拟点击
let autoPrettierInterval: any = null;

export function applyAutoPrettier(
    itemState: ItemSystemState,
    addScoreCallback: (amount: number) => void
): void {
    if (isItemActive(itemState, 'auto_prettier')) {
        if (!autoPrettierInterval) {
            autoPrettierInterval = setInterval(() => {
                // 每200ms触发一次（1秒5次）
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => addScoreCallback(0.5), i * 200);
                }
            }, 1000);
        }
    } else {
        if (autoPrettierInterval) {
            clearInterval(autoPrettierInterval);
            autoPrettierInterval = null;
        }
    }
}

// deep-seek-ai 效果：全自动加分（无miss时）
let deepSeekInterval: any = null;

export function applyDeepSeekAI(
    itemState: ItemSystemState,
    addScoreCallback: (amount: number, x?: number, y?: number) => void,
    createFakeSnippet: () => void
): void {
    if (isItemActive(itemState, 'deep_seek_ai') && itemState.missCount === 0) {
        if (!deepSeekInterval) {
            deepSeekInterval = setInterval(() => {
                // 只在无miss时触发
                if (itemState.missCount === 0) {
                    createFakeSnippet(); // 创建一个假的代码片段
                    setTimeout(() => {
                        addScoreCallback(2.0, window.innerWidth / 2, window.innerHeight / 2);
                    }, 500);
                }
            }, 3000); // 每3秒触发一次
        }
    } else {
        if (deepSeekInterval) {
            clearInterval(deepSeekInterval);
            deepSeekInterval = null;
        }
    }
}

// 创建假的AI代码片段（出现后消失）
export function createAISnippet(container: HTMLElement): void {
    const div = document.createElement('div');
    div.className = 'code-line c-py'; // 使用Python样式
    div.innerText = '# AI Generated...';
    div.style.cssText = `
        position: absolute;
        left: ${window.innerWidth / 2 - 100}px;
        top: ${window.innerHeight - 100}px;
        opacity: 0.7;
        pointer-events: none;
        animation: aiSnippetFade 1s ease;
    `;
    
    // 添加动画
    if (!document.getElementById('ai-snippet-animation')) {
        const style = document.createElement('style');
        style.id = 'ai-snippet-animation';
        style.textContent = `
            @keyframes aiSnippetFade {
                0% { opacity: 0; transform: translateY(50px); }
                30% { opacity: 0.7; transform: translateY(0); }
                70% { opacity: 0.7; transform: translateY(0); }
                100% { opacity: 0; transform: translateY(-30px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    container.appendChild(div);
    setTimeout(() => div.remove(), 1000);
}

// k8s-autoscale 效果：动态倍率
export function getK8sMultiplier(itemState: ItemSystemState, clicksPerSecond: number): number {
    if (!isItemActive(itemState, 'k8s_autoscale')) return 1.0;
    
    // 根据点击频率返回倍率
    if (clicksPerSecond >= 5) return 5.0;
    if (clicksPerSecond >= 4) return 4.0;
    if (clicksPerSecond >= 3) return 3.0;
    if (clicksPerSecond >= 2) return 2.0;
    return 1.5;
}

// lodash-mini 效果：基础积分+2
export function getLodashBonus(itemState: ItemSystemState): number {
    return isItemActive(itemState, 'lodash_mini') ? 2 : 0;
}

// 停止所有道具效果
export function stopAllItemEffects(): void {
    if (autoPrettierInterval) {
        clearInterval(autoPrettierInterval);
        autoPrettierInterval = null;
    }
    if (deepSeekInterval) {
        clearInterval(deepSeekInterval);
        deepSeekInterval = null;
    }
}
