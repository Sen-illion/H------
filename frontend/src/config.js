// 开发时用 Vite 代理，部署后改为后端真实地址（见 .env.production 或部署平台环境变量）
const API_BASE = import.meta.env.VITE_API_BASE || '';
export const API = API_BASE ? `${API_BASE}/api` : '/api';
export const SUBMISSIONS_BASE = API_BASE ? `${API_BASE}/submissions` : '/submissions';

// 纯前端模式（无后端，GitHub Pages）：题目从静态文件读，提交存 localStorage，老师可导出/导入
export const isStandalone = import.meta.env.VITE_STANDALONE === 'true';
const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
/** 静态资源根路径，用于拉取 周末检测/*.txt */
export const staticBase = BASE ? `${BASE}` : '';
