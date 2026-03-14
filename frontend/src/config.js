// 开发时用 Vite 代理，部署后改为后端真实地址（见 .env.production 或部署平台环境变量）
const API_BASE = import.meta.env.VITE_API_BASE || '';
export const API = API_BASE ? `${API_BASE}/api` : '/api';
export const SUBMISSIONS_BASE = API_BASE ? `${API_BASE}/submissions` : '/submissions';
