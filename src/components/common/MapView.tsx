import React, { useEffect, useRef } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Order } from '../../types';

interface MapViewProps {
  orders?: Order[];
  riderLocation?: { lat: number; lng: number };
}

/**
 * 高德地图组件
 * 核心功能：展示地图、标记骑手位置、展示订单分布
 */
const MapView: React.FC<MapViewProps> = ({ riderLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 使用高德官方加载器安全加载 JS API
    AMapLoader.load({
      key: "YOUR_AMAP_KEY", // 开发者需在此处替换为真实的高德 API Key
      version: "2.0",
      plugins: ["AMap.Marker", "AMap.Polyline"]
    }).then((AMap) => {
      if (!mapRef.current) return;

      // 初始化地图实例
      const map = new AMap.Map(mapRef.current, {
        zoom: 13, // 初始缩放级别
        center: [116.397428, 39.90923] // 初始中心点（北京）
      });

      // 如果有骑手位置，添加红色标记
      if (riderLocation) {
        new AMap.Marker({
          position: [riderLocation.lng, riderLocation.lat],
          map: map,
          icon: 'https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png'
        });
        // 将地图中心移动到骑手位置
        map.setCenter([riderLocation.lng, riderLocation.lat]);
      }
    }).catch(e => {
      console.error("地图加载失败:", e);
    });
  }, [riderLocation]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-2xl overflow-hidden bg-slate-200 border border-slate-100" 
      id="amap-container"
    />
  );
};

export default MapView;
