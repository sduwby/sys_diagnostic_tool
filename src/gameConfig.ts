// --- 游戏配置模块 ---

// 语言配置接口
export interface LangConfig {
    name: string;
    score: number;
    speedBonus: number;
    colorClass: string;
    snippets: string[];
}

// 语言配置
export const LANG_CONFIG: LangConfig[] = [
    { name: 'JS', score: 1.0, speedBonus: 1.000, colorClass: 'c-ts', snippets: ['console.log(v);', 'const x = 0;', 'await fetch();', 'res.json()'] },
    { name: 'C++', score: 1.5, speedBonus: 1.025, colorClass: 'c-cpp', snippets: ['int main()', 'std::cout<<x;', 'ptr = &y;', '#include<os>'] },
    { name: 'Java', score: 2.0, speedBonus: 1.050, colorClass: 'c-java', snippets: ['public class A', 'System.out.println', 'List<?> list', 'throws Error'] },
    { name: 'Go', score: 2.5, speedBonus: 1.075, colorClass: 'c-go', snippets: ['func main()', 'fmt.Println', 'go func()', 'if err != nil'] },
    { name: 'Py', score: 3.0, speedBonus: 1.100, colorClass: 'c-py', snippets: ['def init():', 'import sys', 'print(f"{x}")', 'if __name__'] }
];

// 自定义代码库配置
export const CUSTOM_LANG: LangConfig = {
    name: 'Custom',
    score: 1.5,
    speedBonus: 1.000,
    colorClass: 'c-custom',
    snippets: []
};

// 难度计算
export function getDifficultyMultiplier(seconds: number): number {
    return 1.0 + Math.pow(seconds / 120, 1.2) * 0.5;
}

// 等级计算
export function getLevel(seconds: number): number {
    return Math.floor(seconds / 60) + 1;
}

// 最大Miss数
export function getMaxMisses(level: number): number {
    return 10 + (level - 1) * 5;
}
