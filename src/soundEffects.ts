// --- 音效系统模块 (Web Audio API) ---

class SoundEffects {
    private audioContext: AudioContext | null = null;
    private masterVolume: number = 0.3;
    private enabled: boolean = true;

    constructor() {
        // 延迟初始化 AudioContext (需要用户交互后才能创建)
        this.init();
    }

    private init(): void {
        try {
            // @ts-ignore - AudioContext 兼容性处理
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
            }
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    // 确保 AudioContext 已启动
    private async ensureContext(): Promise<void> {
        if (!this.audioContext || !this.enabled) return;
        
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    // 播放点击音效（短促的哔声）
    async playClick(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // 明亮的点击音：800Hz
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        // 快速衰减
        gainNode.gain.setValueAtTime(this.masterVolume * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
    }

    // 播放连击音效（根据连击数调整音高）
    async playCombo(comboCount: number): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // 连击数越高，音调越高
        const baseFreq = 600;
        const freq = baseFreq + (comboCount * 50);
        oscillator.frequency.value = Math.min(freq, 2000); // 限制最高频率
        oscillator.type = 'square';

        // 音量随连击数增加
        const volume = Math.min(this.masterVolume * (0.2 + comboCount * 0.02), this.masterVolume);
        gainNode.gain.setValueAtTime(volume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    }

    // 播放Miss音效（低沉的错误音）
    async playMiss(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // 低沉的错误音：200Hz 下降到 100Hz
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(this.masterVolume * 0.4, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    }

    // 播放游戏结束音效
    async playGameOver(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        
        // 播放三个连续的下降音
        for (let i = 0; i < 3; i++) {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            const startFreq = 400 - (i * 100);
            oscillator.frequency.value = startFreq;
            oscillator.type = 'triangle';

            const startTime = ctx.currentTime + (i * 0.15);
            gainNode.gain.setValueAtTime(this.masterVolume * 0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.15);
        }
    }

    // 播放成就解锁音效
    async playAchievement(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        
        // 播放上升的和弦（C-E-G）
        const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
        
        frequencies.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = ctx.currentTime + (i * 0.1);
            gainNode.gain.setValueAtTime(this.masterVolume * 0.25, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    }

    // 1. 等级提升音效
    async playLevelUp(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        
        // 播放快速上升音阶
        const frequencies = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
        
        frequencies.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'triangle';

            const startTime = ctx.currentTime + (i * 0.08);
            gainNode.gain.setValueAtTime(this.masterVolume * 0.35, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.2);
        });
    }

    // 2. 完美连击音效（20+/50+连击）
    async playPerfectCombo(milestone: number): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        
        // 不同里程碑不同音效
        const frequencies = milestone >= 50 
            ? [1046.5, 1318.51, 1567.98, 2093] // C6-C7 (史诗)
            : [783.99, 987.77, 1174.66, 1567.98]; // G5-G6 (完美)
        
        frequencies.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = ctx.currentTime + (i * 0.06);
            gainNode.gain.setValueAtTime(this.masterVolume * 0.4, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.25);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.25);
        });
    }

    // 3. 暂停音效
    async playPause(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 500;
        oscillator.type = 'square';

        gainNode.gain.setValueAtTime(this.masterVolume * 0.15, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.08);
    }

    // 4. 按钮点击音效
    async playButtonClick(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.masterVolume * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.04);
    }

    // 5. 设置保存音效
    async playSaveSettings(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        
        // 播放两个音符表示"确认"
        [880, 1046.5].forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = ctx.currentTime + (i * 0.08);
            gainNode.gain.setValueAtTime(this.masterVolume * 0.25, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.15);
        });
    }

    // 6. 作弊激活音效
    async playCheatActivated(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        
        // 播放神秘的音效（降-升-降）
        const frequencies = [700, 1200, 700];
        
        frequencies.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'triangle';

            const startTime = ctx.currentTime + (i * 0.1);
            gainNode.gain.setValueAtTime(this.masterVolume * 0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.12);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.12);
        });
    }

    // 7. 低稳定度警告音效
    async playLowStabilityWarning(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // 低频警告音：150Hz
        oscillator.frequency.value = 150;
        oscillator.type = 'sawtooth';

        gainNode.gain.setValueAtTime(this.masterVolume * 0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.3);
    }

    // 8. 即将失败音效
    async playNearFail(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        
        // 播放紧张的重复音
        for (let i = 0; i < 2; i++) {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = 250;
            oscillator.type = 'square';

            const startTime = ctx.currentTime + (i * 0.12);
            gainNode.gain.setValueAtTime(this.masterVolume * 0.35, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.1);
        }
    }

    // 9. 接近成就提示音
    async playNearAchievement(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        // 温和的提示音
        oscillator.frequency.value = 900;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(this.masterVolume * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    }

    // 10. 破纪录音效
    async playNewRecord(): Promise<void> {
        if (!this.enabled || !this.audioContext) return;
        await this.ensureContext();

        const ctx = this.audioContext;
        
        // 播放辉煌的五音和弦
        const frequencies = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5-E6
        
        frequencies.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.value = freq;
            oscillator.type = 'sine';

            const startTime = ctx.currentTime + (i * 0.09);
            gainNode.gain.setValueAtTime(this.masterVolume * 0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);

            oscillator.start(startTime);
            oscillator.stop(startTime + 0.35);
        });
    }

    // 设置主音量（0-1）
    setVolume(volume: number): void {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    // 切换音效开关
    toggle(): void {
        this.enabled = !this.enabled;
    }

    // 获取音效状态
    isEnabled(): boolean {
        return this.enabled;
    }
}

// 导出单例
const soundEffects = new SoundEffects();

export {
    soundEffects
};