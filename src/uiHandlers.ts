// --- UI事件处理模块 ---
import { CUSTOM_SNIPPETS_STORE, ACHIEVEMENT_STORE } from './storage';
import { soundEffects } from './soundEffects';
import { CUSTOM_LANG } from './gameConfig';

// 设置面板管理
export function initSettingsPanel(achievementData: any, checkAndUnlockAchievement: (id: string, data: any, cb?: any, notify?: boolean) => void): void {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            soundEffects.playButtonClick();
            if (settingsPanel) settingsPanel.style.display = 'block';
            renderCustomSnippetsList();
        });
    }
    
    // 绑定全局函数
    (window as any).closeSettings = () => {
        soundEffects.playButtonClick();
        if (settingsPanel) settingsPanel.style.display = 'none';
    };
    
    (window as any).addCustomSnippet = () => {
        const input = document.getElementById('new-snippet-input') as HTMLInputElement;
        const text = input?.value.trim();
        
        if (!text) {
            alert('Please enter a code snippet.');
            return;
        }
        
        if (text.length < 3) {
            alert('Snippet must be at least 3 characters long.');
            return;
        }
        
        if (CUSTOM_LANG.snippets.includes(text)) {
            alert('This snippet already exists.');
            return;
        }
        
        CUSTOM_LANG.snippets.push(text);
        CUSTOM_SNIPPETS_STORE.save(CUSTOM_LANG.snippets);
        soundEffects.playSaveSettings();
        if (input) input.value = '';
        renderCustomSnippetsList();
        
        // 标记设置已保存
        if (!achievementData.stats.settingsSaved) {
            achievementData.stats.settingsSaved = true;
            ACHIEVEMENT_STORE.save(achievementData);
            checkAndUnlockAchievement('config_sync', achievementData, undefined, true);
        }
    };
    
    (window as any).removeCustomSnippet = (index: number) => {
        CUSTOM_LANG.snippets.splice(index, 1);
        CUSTOM_SNIPPETS_STORE.save(CUSTOM_LANG.snippets);
        renderCustomSnippetsList();
    };
    
    (window as any).exportCustomSnippets = () => {
        if (CUSTOM_LANG.snippets.length === 0) {
            alert('No custom snippets to export.');
            return;
        }
        
        const content = JSON.stringify(CUSTOM_LANG.snippets, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `custom_snippets_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    (window as any).importSnippets = () => {
        const fileInput = document.getElementById('import-file-input') as HTMLInputElement;
        if (!fileInput) return;
        
        fileInput.click();
        
        fileInput.onchange = function(e: any) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event: any) {
                try {
                    const imported = JSON.parse(event.target.result);
                    if (!Array.isArray(imported)) {
                        alert('Invalid format. Expected JSON array.');
                        return;
                    }
                    
                    let added = 0;
                    imported.forEach((snippet: any) => {
                        if (typeof snippet === 'string' && snippet.length >= 3 && !CUSTOM_LANG.snippets.includes(snippet)) {
                            CUSTOM_LANG.snippets.push(snippet);
                            added++;
                        }
                    });
                    
                    if (added > 0) {
                        CUSTOM_SNIPPETS_STORE.save(CUSTOM_LANG.snippets);
                        renderCustomSnippetsList();
                        alert(`Successfully imported ${added} snippet(s).`);
                    } else {
                        alert('No new snippets were imported.');
                    }
                } catch (e) {
                    alert('Failed to parse JSON file.');
                }
            };
            reader.readAsText(file);
            fileInput.value = '';
        };
    };
}

// 渲染自定义代码列表
function renderCustomSnippetsList(): void {
    const list = document.getElementById('custom-snippets-list');
    const emptyHint = document.getElementById('empty-hint');
    
    if (!list) return;
    
    if (CUSTOM_LANG.snippets.length === 0) {
        if (emptyHint) emptyHint.style.display = 'block';
        list.innerHTML = '<div style="color: #888; font-size: 12px; font-style: italic;" id="empty-hint">No custom snippets yet.</div>';
        return;
    }
    
    if (emptyHint) emptyHint.style.display = 'none';
    list.innerHTML = CUSTOM_LANG.snippets.map((snippet, index) => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px; border-bottom: 1px solid #3e3e42;">
            <code style="color: #d4d4d4; flex: 1;">${snippet}</code>
            <button onclick="removeCustomSnippet(${index})" style="background: #f44747; color: #fff; border: none; padding: 4px 8px; cursor: pointer; border-radius: 2px;">✕</button>
        </div>
    `).join('');
}
