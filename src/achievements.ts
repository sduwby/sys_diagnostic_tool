// --- 成就定义与管理 ---
import { ACHIEVEMENT_STORE } from './storage';

const ACHIEVEMENTS: any[] = [
    // 第一梯队：初级工程师
    {
        id: 'env_ready',
        name: 'Env Ready',
        tier: 1,
        description: '成功挂载本地开发环境，依赖包加载完成',
        check: (stats: any) => true,
        type: 'once'
    },
    {
        id: 'unit_pass',
        name: 'Unit Pass',
        tier: 1,
        description: '基础逻辑校验成功，核心链路已调通',
        check: (stats: any) => stats.totalClicks >= 100,
        requirement: 100,
        current: (stats: any) => stats.totalClicks,
        type: 'count'
    },
    {
        id: 'heartbeat',
        name: 'Heartbeat',
        tier: 1,
        description: '后台驻留进程活跃，服务监测无异常',
        check: (stats: any) => stats.totalRuntime >= 300,
        requirement: 300,
        current: (stats: any) => stats.totalRuntime,
        type: 'count'
    },
    {
        id: 'hotfix',
        name: 'Hotfix',
        tier: 1,
        description: '紧急响应线上回滚指令，阻止非预期中断',
        check: (stats: any) => stats.bossKeyUsed,
        type: 'once'
    },
    {
        id: 'config_sync',
        name: 'Config Sync',
        tier: 1,
        description: '全局环境变量已更新，生产环境参数对齐',
        check: (stats: any) => stats.settingsSaved,
        type: 'once'
    },
    
    // 第二梯队：高级开发
    {
        id: 'high_concurrency',
        name: 'High Concurrency',
        tier: 2,
        description: '瞬时流量突破阈值，负载均衡逻辑生效',
        check: (stats: any) => stats.maxConcurrentKeys >= 8,
        requirement: 8,
        current: (stats: any) => stats.maxConcurrentKeys,
        type: 'count'
    },
    {
        id: 'high_availability',
        name: 'High Availability',
        tier: 2,
        description: '系统稳定性测试达标，Uptime 指标优异',
        check: (stats: any) => stats.totalRuntime >= 1800,
        requirement: 1800,
        current: (stats: any) => stats.totalRuntime,
        type: 'count'
    },
    {
        id: 'persistence',
        name: 'Persistence',
        tier: 2,
        description: '异步数据写入落盘，确保事务原子性',
        check: (stats: any) => stats.firstDataSave,
        type: 'once'
    },
    {
        id: 'agile_sprint',
        name: 'Agile Sprint',
        tier: 2,
        description: '短周期快速迭代，Sprint 交付提前达成',
        check: (stats: any) => stats.fastGameCompletion,
        type: 'once'
    },
    {
        id: 'full_stack',
        name: 'Full Stack',
        tier: 2,
        description: '跨端协议适配完成，多端数据同步正常',
        check: (stats: any) => stats.tabSwitchCount >= 1,
        type: 'once'
    },
    {
        id: 'stress_test',
        name: 'Stress Test',
        tier: 2,
        description: '系统抗压能力验证通过，吞吐量保持稳定',
        check: (stats: any) => stats.longSession,
        type: 'once'
    },
    
    // 第三梯队：技术专家
    {
        id: 'big_data',
        name: 'Big Data',
        tier: 3,
        description: '海量日志清洗完成，数据仓库索引建立完毕',
        check: (stats: any) => stats.totalClicks >= 10000,
        requirement: 10000,
        current: (stats: any) => stats.totalClicks,
        type: 'count'
    },
    {
        id: 'five_nines',
        name: 'Five Nines',
        tier: 3,
        description: '服务可用性达到 99.999%，符合 SLA 标准',
        check: (stats: any) => stats.totalRuntime >= 14400,
        requirement: 14400,
        current: (stats: any) => stats.totalRuntime,
        type: 'count'
    },
    {
        id: 'zero_latency',
        name: 'Zero Latency',
        tier: 3,
        description: '反射弧级安全审计，拦截非法扫描尝试',
        check: (stats: any) => stats.fastestBossKeyResponse < 500,
        requirement: 500,
        current: (stats: any) => stats.fastestBossKeyResponse,
        type: 'count'
    },
    {
        id: 'friday_warrior',
        name: 'Friday Warrior',
        tier: 3,
        description: '具备极强的抗风险能力，顶压力完成周五发布',
        check: (stats: any) => stats.fridayAfternoon,
        type: 'once'
    },
    {
        id: 'refactoring',
        name: 'Refactoring',
        tier: 3,
        description: '底层代码重构完成，技术债已基本出清',
        check: (stats: any, achievements: any) => {
            const unlocked = Object.values(achievements).filter((a: any) => a.unlocked && a.tier <= 2).length;
            return unlocked >= 10;
        },
        type: 'once'
    },
    {
        id: 'cache_hit',
        name: 'Cache Hit',
        tier: 3,
        description: '局部性原理生效，数据读取速度大幅提升',
        check: (stats: any) => stats.secretSequence,
        type: 'once'
    },
    
    // 第四梯队：首席架构师
    {
        id: 'offline_mode',
        name: 'Offline Mode',
        tier: 4,
        description: '边缘计算节点激活，支持离线灾备处理',
        check: (stats: any) => stats.offlineDuration >= 900,
        requirement: 900,
        current: (stats: any) => stats.offlineDuration || 0,
        type: 'count'
    },
    {
        id: 'kernel_inject',
        name: 'Kernel Inject',
        tier: 4,
        description: '内核级驱动补丁已加载，系统性能获得永久性 Buff',
        check: (stats: any) => stats.coffeeCode,
        type: 'once'
    },
    {
        id: 'final_build',
        name: 'Final Build',
        tier: 4,
        description: 'Version 1.0 正式版发布，具备行业领军水平的健壮性',
        check: (stats: any, achievements: any) => {
            const total = ACHIEVEMENTS.length;
            const unlocked = Object.values(achievements).filter((a: any) => a.unlocked && a.id !== 'final_build').length;
            return unlocked === total - 1;
        },
        type: 'once'
    }
];

export { ACHIEVEMENTS, ACHIEVEMENT_STORE };
