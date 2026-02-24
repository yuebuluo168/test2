import React, { useState, useContext } from 'react';
import { motion } from 'motion/react';
import { Order } from '../../types';
import { AuthContext } from '../../App';

interface OrderPublishModalProps {
  onClose: () => void;
  onSuccess: (order: Order) => void;
}

/**
 * 商家发布订单弹窗
 * 核心功能：
 * 1. 填写订单基本信息
 * 2. 模拟价格计算逻辑
 * 3. 提交订单到后端并广播
 */
const OrderPublishModal: React.FC<OrderPublishModalProps> = ({ onClose, onSuccess }) => {
  const auth = useContext(AuthContext);
  const [formData, setFormData] = useState({
    order_number: `ORD-${Date.now()}`,
    customer_name: '',
    customer_phone: '',
    destination_address: '',
    weight: 1,
    distance: 2.5,
    type: 'instant' as 'instant' | 'scheduled',
    remarks: ''
  });

  /**
   * 提交订单
   */
  const handleSubmit = async () => {
    if (!formData.customer_name || !formData.destination_address) {
      alert('请填写完整配送信息');
      return;
    }

    // 模拟价格计算逻辑（基础费5 + 距离费*2 + 重量费*1）
    const price = 5 + formData.distance * 2 + formData.weight * 1;

    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...formData, 
          merchant_id: auth?.user?.id,
          destination_lat: 39.9, // 模拟经纬度
          destination_lng: 116.4, 
          price
        })
      });
      
      if (res.ok) {
        const order = await res.json();
        onSuccess(order);
        onClose();
        alert('订单发布成功！骑手将很快接单。');
      }
    } catch (error) {
      alert('发布失败，请检查网络');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-6 shadow-2xl"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800">发布配送任务</h2>
          <button onClick={onClose} className="text-slate-400 font-bold p-2">取消</button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">收货人信息</label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                placeholder="姓名" 
                className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                value={formData.customer_name}
                onChange={e => setFormData({...formData, customer_name: e.target.value})}
              />
              <input 
                placeholder="电话" 
                className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                value={formData.customer_phone}
                onChange={e => setFormData({...formData, customer_phone: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">送达地址</label>
            <input 
              placeholder="请输入详细地址" 
              className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              value={formData.destination_address}
              onChange={e => setFormData({...formData, destination_address: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">物品属性</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-slate-50 rounded-2xl p-3 flex flex-col">
                <span className="text-[8px] font-bold text-slate-400 uppercase">重量 (kg)</span>
                <input 
                  type="number" 
                  className="bg-transparent border-none outline-none font-bold text-lg"
                  value={formData.weight}
                  onChange={e => setFormData({...formData, weight: Number(e.target.value)})}
                />
              </div>
              <div className="flex-1 bg-slate-50 rounded-2xl p-3 flex flex-col">
                <span className="text-[8px] font-bold text-slate-400 uppercase">预估距离 (km)</span>
                <input 
                  type="number" 
                  className="bg-transparent border-none outline-none font-bold text-lg"
                  value={formData.distance}
                  onChange={e => setFormData({...formData, distance: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">备注说明</label>
            <textarea 
              placeholder="例如：餐点易碎，请轻放..." 
              className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none h-24 focus:ring-2 focus:ring-indigo-500 font-medium text-sm"
              value={formData.remarks}
              onChange={e => setFormData({...formData, remarks: e.target.value})}
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all"
        >
          确认发布 (预计 ¥{(5 + formData.distance * 2 + formData.weight * 1).toFixed(2)})
        </button>
      </motion.div>
    </div>
  );
};

export default OrderPublishModal;
