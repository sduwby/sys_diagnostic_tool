// --- 成就UI渲染模块 ---
import { ACHIEVEMENT_STORE }  from './storage';
import { ACHIEVEMENTS } from './achievements';

(window as any).openAchievements = function(): void {
    const panel = document.getElementById('achievements-panel');
    if (panel) {
        panel.style.display = 'block';
        renderAchievements();
    }
};

(window as any).closeAchievements = function(): void {
    const panel = document.getElementById('achievements-panel');
    if (panel) {
        panel.style.display = 'none';
    }
};

function renderAchievements(): void {
    const achievementData = ACHIEVEMENT_STORE.load();
    const container = document.getElementById('achievements-list');
    if (!container) return;
    
    const tierNames = ['', 'Entry Level', 'Senior Dev', 'Tech Lead', 'Chief Architect'];
    const tierColors = ['', '#6a9955', '#4ec9b0', '#dcdcaa', '#ff79c6'];
    
    let html = '';
    
    for (let tier = 1; tier <= 4; tier++) {
        const tierAchievements = ACHIEVEMENTS.filter((a: any) => a.tier === tier);
        const unlockedCount = tierAchievements.filter((a: any) => achievementData.achievements[a.id]?.unlocked).length;
        
        html += `
            <div style="margin-bottom: 20px;">
                <div style="font-weight: bold; color: ${tierColors[tier]}; margin-bottom: 10px; font-size: 14px;">
                    ${tierNames[tier]} (${unlockedCount}/${tierAchievements.length})
                </div>
        `;
        
        tierAchievements.forEach((achievement: any) => {
            const state = achievementData.achievements[achievement.id];
            const unlocked = state?.unlocked;
            const progress = state?.progress || 0;
            const requirement = achievement.requirement || 100;
            const progressPercent = achievement.type === 'count' ? Math.min(100, (progress / requirement) * 100) : (unlocked ? 100 : 0);
            
            html += `
                <div style="
                    background: ${unlocked ? 'rgba(78, 201, 176, 0.1)' : 'rgba(60, 60, 60, 0.3)'};
                    border: 1px solid ${unlocked ? '#4ec9b0' : '#555'};
                    border-radius: 4px;
                    padding: 10px;
                    margin-bottom: 8px;
                    opacity: ${unlocked ? '1' : '0.6'};
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <div style="font-weight: bold; color: ${unlocked ? '#4ec9b0' : '#888'};">
                            ${unlocked ? '✓' : '○'} ${achievement.name}
                        </div>
                        ${unlocked ? `<div style="font-size: 10px; color: #888;">${new Date(state.unlockedAt).toLocaleString()}</div>` : ''}
                    </div>
                    <div style="font-size: 11px; color: #aaa; margin-bottom: 5px;">
                        ${achievement.description}
                    </div>
                    ${achievement.type === 'count' && !unlocked ? `
                        <div style="background: #1e1e1e; height: 4px; border-radius: 2px; overflow: hidden; margin-top: 5px;">
                            <div style="background: #4ec9b0; height: 100%; width: ${progressPercent}%; transition: width 0.3s;"></div>
                        </div>
                        <div style="font-size: 10px; color: #888; margin-top: 3px;">
                            ${progress} / ${requirement}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    container.innerHTML = html;
}

export { renderAchievements };
