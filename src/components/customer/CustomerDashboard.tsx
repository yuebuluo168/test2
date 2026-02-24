import React, { useContext } from 'react';
import { LogOut, ClipboardList, ShoppingBag } from 'lucide-react';
import { AuthContext } from '../../App';

/**
 * 顾客端仪表盘
 * 核心功能：
 * 1. 查看我的订单列表
 * 2. 追踪配送状态
 */
const CustomerDashboard = () => {
  const auth = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* 顶部栏 */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold italic shadow-lg shadow-indigo-100">A</div>
          <h1 className="text-xl font-bold text-slate-800">我的订单</h1>
        </div>
        <button onClick={auth?.logout} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* 订单列表区域 */}
      <div className="space-y-6">
        {/* 空状态展示 */}
        <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center text-slate-300 text-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <ShoppingBag size={40} className="opacity-20" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">暂无活跃订单</h3>
          <p className="text-sm font-medium mb-8 max-w-[200px]">您还没有正在配送中的订单，快去点一份外卖吧！</p>
          <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 active:scale-95 transition-all">
            立即去下单
          </button>
        </div>

        {/* 历史记录入口 */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
              <ClipboardList size={24} />
            </div>
            <div>
              <div className="font-bold text-slate-800">历史订单记录</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">查看已完成的配送</div>
            </div>
          </div>
          <button className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-colors">
            <LogOut className="rotate-180" size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
