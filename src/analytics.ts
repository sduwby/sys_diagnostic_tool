// --- 历史成绩分析模块 ---
import { SECURE_STORE } from './storage';

(window as any).showAnalytics = function(): void {
    const analyticsPanel = document.getElementById('analytics-panel');
    if (analyticsPanel) analyticsPanel.style.display = 'block';
    
    const scores = SECURE_STORE.load();
    if (scores.length === 0) {
        alert('No data available for analytics.');
        return;
    }
    
    renderTrendChart(scores);
    renderPieChart(scores);
    renderStatsSummary(scores);
};

(window as any).closeAnalytics = function(): void {
    const panel = document.getElementById('analytics-panel');
    if (panel) panel.style.display = 'none';
};

function renderTrendChart(scores: any[]): void {
    const canvas = document.getElementById('trend-chart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#4ec9b0';
    ctx.fillStyle = '#d4d4d4';
    ctx.font = '10px Consolas, monospace';
    
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const data = scores.slice(0, 10).reverse();
    if (data.length === 0) return;
    
    const maxScore = Math.max(...data.map((s: any) => s.score));
    const minScore = Math.min(...data.map((s: any) => s.score));
    const range = maxScore - minScore || 1;
    
    ctx.strokeStyle = '#555';
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    ctx.strokeStyle = '#4ec9b0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point: any, index: number) => {
        const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
        const y = height - padding - ((point.score - minScore) / range) * chartHeight;
        
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        ctx.fillStyle = '#4ec9b0';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    });
    
    ctx.stroke();
    
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    data.forEach((_: any, index: number) => {
        const x = padding + (chartWidth / (data.length - 1 || 1)) * index;
        ctx.fillText(`${index + 1}`, x, height - padding + 15);
    });
    
    ctx.textAlign = 'right';
    ctx.fillText(maxScore.toFixed(0), padding - 5, padding + 5);
    ctx.fillText(minScore.toFixed(0), padding - 5, height - padding + 5);
}

function renderPieChart(scores: any[]): void {
    const canvas = document.getElementById('pie-chart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = canvas.clientWidth * dpr;
    canvas.height = canvas.clientHeight * dpr;
    ctx.scale(dpr, dpr);
    
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;
    
    ctx.clearRect(0, 0, width, height);
    
    const ranges = [
        { label: '0-50', min: 0, max: 50, color: '#6a9955' },
        { label: '50-100', min: 50, max: 100, color: '#4ec9b0' },
        { label: '100-200', min: 100, max: 200, color: '#dcdcaa' },
        { label: '200+', min: 200, max: Infinity, color: '#ff79c6' }
    ];
    
    const distribution = ranges.map(range => ({
        ...range,
        count: scores.filter((s: any) => s.score >= range.min && s.score < range.max).length
    }));
    
    const total = scores.length;
    let startAngle = -Math.PI / 2;
    
    distribution.forEach(segment => {
        if (segment.count === 0) return;
        
        const angle = (segment.count / total) * Math.PI * 2;
        
        ctx.fillStyle = segment.color;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = '#1e1e1e';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        const labelAngle = startAngle + angle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
        const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
        
        ctx.fillStyle = '#fff';
        ctx.font = '12px Consolas, monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${segment.label}`, labelX, labelY - 8);
        ctx.font = '10px Consolas, monospace';
        ctx.fillText(`${segment.count}`, labelX, labelY + 8);
        
        startAngle += angle;
    });
}

function renderStatsSummary(scores: any[]): void {
    const container = document.getElementById('stats-summary');
    if (!container) return;
    
    const sortedScores = scores.map((s: any) => s.score).sort((a: number, b: number) => b - a);
    const total = sortedScores.length;
    const max = sortedScores[0];
    const min = sortedScores[sortedScores.length - 1];
    const avg = sortedScores.reduce((a: number, b: number) => a + b, 0) / total;
    const median = total % 2 === 0 
        ? (sortedScores[total / 2 - 1] + sortedScores[total / 2]) / 2 
        : sortedScores[Math.floor(total / 2)];
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 15px;">
            <div style="background: rgba(60, 60, 60, 0.5); padding: 10px; border-radius: 4px;">
                <div style="color: #888; font-size: 10px;">Total Sessions</div>
                <div style="color: #4ec9b0; font-size: 18px; font-weight: bold;">${total}</div>
            </div>
            <div style="background: rgba(60, 60, 60, 0.5); padding: 10px; border-radius: 4px;">
                <div style="color: #888; font-size: 10px;">Best Score</div>
                <div style="color: #4ec9b0; font-size: 18px; font-weight: bold;">${max.toFixed(1)}</div>
            </div>
            <div style="background: rgba(60, 60, 60, 0.5); padding: 10px; border-radius: 4px;">
                <div style="color: #888; font-size: 10px;">Average</div>
                <div style="color: #4ec9b0; font-size: 18px; font-weight: bold;">${avg.toFixed(1)}</div>
            </div>
            <div style="background: rgba(60, 60, 60, 0.5); padding: 10px; border-radius: 4px;">
                <div style="color: #888; font-size: 10px;">Median</div>
                <div style="color: #4ec9b0; font-size: 18px; font-weight: bold;">${median.toFixed(1)}</div>
            </div>
        </div>
    `;
}