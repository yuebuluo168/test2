import React, { useState, useEffect, useContext } from 'react';
import { 
  LogOut, 
  Settings2, 
  BarChart3, 
  Users, 
  Map as MapIcon,
  Save,
  RefreshCw
} from 'lucide-react';
import { AuthContext } from '../../App';
import MapView from '../common/MapView';

/**
 * 管理后台仪表盘
 * 核心功能：
 * 1. 价格配置（基础费、里程费、重量费）
 * 2. 实时地图监控
 * 3. 平台数据概览
 */
const AdminDashboard = () => {
  const auth = useContext(AuthContext);
  const [config, setConfig] = useState({ base_price: 5, per_km_price: 2, per_kg_price: 1 });
  const [loading, setLoading] = useState(false);
  const [stats] = useState({ users: 128, orders: 1542, revenue: 8420 });

  // 页面加载时从后端获取当前配置
  useEffect(() => {
    fetch('/api/config/price')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error('获取配置失败:', err));
  }, []);

  /**
   * 保存配置到后端数据库
   */
  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/config/price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        alert('全局价格配置已成功保存到数据库！');
      }
    } catch (error) {
      alert('保存失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* 侧边导航栏 (桌面端) */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-100 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold italic shadow-lg shadow-indigo-100">A</div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tighter">管理后台</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold text-sm">
            <Settings2 size={18} /> 系统配置
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-colors">
            <BarChart3 size={18} /> 数据分析
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-colors">
            <Users size={18} /> 用户管理
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-50 rounded-2xl font-bold text-sm transition-colors">
            <MapIcon size={18} /> 实时监控
          </button>
        </nav>

        <button 
          onClick={auth?.logout}
          className="mt-auto flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-500 transition-colors font-bold text-sm"
        >
          <LogOut size={18} /> 退出登录
        </button>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">系统概览</h2>
            <p className="text-sm text-slate-400 font-medium">欢迎回来，管理员。这是今天的平台运行数据。</p>
          </div>
          <button className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-indigo-600 transition-colors">
            <RefreshCw size={20} />
          </button>
        </header>

        {/* 数据统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: '活跃用户', value: stats.users, icon: <Users className="text-blue-500" /> },
            { label: '今日订单', value: stats.orders, icon: <BarChart3 className="text-emerald-500" /> },
            { label: '今日营收', value: `¥${stats.revenue}`, icon: <Save className="text-amber-500" /> },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-6">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">{s.icon}</div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
                <div className="text-2xl font-bold text-slate-800">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 价格配置面板 */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <Settings2 size={20} className="text-indigo-600" />
              <h3 className="font-bold text-slate-800">配送费计费规则</h3>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">基础配送费 (元)</label>
                <input 
                  type="number" 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg" 
                  value={config.base_price}
                  onChange={e => setConfig({...config, base_price: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">里程加价 (元/公里)</label>
                <input 
                  type="number" 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg" 
                  value={config.per_km_price}
                  onChange={e => setConfig({...config, per_km_price: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase ml-1">重量加价 (元/公斤)</label>
                <input 
                  type="number" 
                  className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-lg" 
                  value={config.per_kg_price}
                  onChange={e => setConfig({...config, per_kg_price: Number(e.target.value)})}
                />
              </div>
              
              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {loading ? '正在保存...' : '保存全局配置'}
              </button>
            </div>
          </div>

          {/* 地图监控面板 */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
              <MapIcon size={20} className="text-indigo-600" />
              <h3 className="font-bold text-slate-800">全城配送实时监控</h3>
            </div>
            <div className="h-[400px] rounded-3xl overflow-hidden border border-slate-100">
              <MapView />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
