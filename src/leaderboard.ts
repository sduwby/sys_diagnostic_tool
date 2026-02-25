// --- 排行榜系统模块 ---
import { SECURE_STORE, ACHIEVEMENT_STORE } from './storage';

// 检查是否进入排行榜
export function checkHighScores(currentScore: number): void {
    const scores = SECURE_STORE.load();
    const isQualified = scores.length < 10 || currentScore > scores[scores.length - 1].score;
    if (isQualified) {
        const inputArea = document.getElementById('input-area');
        if (inputArea) {
            inputArea.classList.remove('hidden');
            setTimeout(() => { 
                const playerNameInput = document.getElementById('player-name') as HTMLInputElement;
                if (playerNameInput) playerNameInput.focus();
            }, 100);
        }
    } else {
        renderLeaderboard(scores);
    }
}

// 提交分数
export function submitScore(currentScore: number, achievementData: any, checkAndUnlockAchievement: (id: string, notify: boolean) => void): void {
    const playerNameInput = document.getElementById('player-name') as HTMLInputElement;
    const name = playerNameInput?.value.trim() || 'Guest';
    const scores = SECURE_STORE.load();
    scores.push({ name: name, score: currentScore, date: new Date().toLocaleDateString(), timestamp: Date.now() });
    scores.sort((a: any, b: any) => b.score - a.score || a.timestamp - b.timestamp);
    if (scores.length > 10) scores.length = 10;
    SECURE_STORE.save(scores);
    
    // 标记首次数据保存
    if (!achievementData.stats.firstDataSave) {
        achievementData.stats.firstDataSave = true;
        ACHIEVEMENT_STORE.save(achievementData);
        checkAndUnlockAchievement('persistence', true);
    }
    
    const inputArea = document.getElementById('input-area');
    if (inputArea) inputArea.classList.add('hidden');
    renderLeaderboard(scores);
}

// 渲染排行榜
function renderLeaderboard(scores: any[]): void {
    const tbody = document.getElementById('lb-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    if (scores.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">No logs.</td></tr>';
        return;
    }
    scores.forEach((s: any, index: number) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${index + 1}</td><td style="color:#ce9178">${s.name}</td><td style="font-weight:bold">${s.score.toFixed(1)}</td><td style="font-size:0.8em">${s.date}</td>`;
        tbody.appendChild(tr);
    });
}

// 数据导出功能
export function exportScores(format = 'json'): void {
    const scores = SECURE_STORE.load();
    if (scores.length === 0) {
        alert('No data to export.');
        return;
    }
    
    let content = '';
    let filename = '';
    let mimeType = '';
    
    if (format === 'json') {
        content = JSON.stringify(scores, null, 2);
        filename = `diagnostic_logs_${Date.now()}.json`;
        mimeType = 'application/json';
    } else if (format === 'csv') {
        const headers = 'Rank,User,Objects,Date\n';
        const rows = scores.map((s: any, i: number) => `${i+1},${s.name},${s.score},${s.date}`).join('\n');
        content = headers + rows;
        filename = `diagnostic_logs_${Date.now()}.csv`;
        mimeType = 'text/csv';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
