package com.appstudio.delivery.core.location

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.amap.api.location.AMapLocationClient
import com.amap.api.location.AMapLocationClientOption
import com.amap.api.location.AMapLocationListener

/**
 * RiderLocationService - 骑手后台定位核心服务
 * 
 * 为什么必须用原生开发？
 * 1. 安卓系统对后台进程限制极严，Web 方案在手机熄屏后定位会立即失效。
 * 2. 原生 Service 配合前台通知（Foreground Service）是保证骑手轨迹不丢失的唯一方案。
 */
class RiderLocationService : Service() {

    private var locationClient: AMapLocationClient? = null

    override fun onCreate() {
        super.onCreate()
        // 创建前台通知，确保服务不被系统杀掉
        startForeground(1, createNotification())
        initLocation()
    }

    /**
     * 初始化高德原生定位 SDK
     */
    private fun initLocation() {
        try {
            locationClient = AMapLocationClient(applicationContext)
            val option = AMapLocationClientOption().apply {
                locationMode = AMapLocationClientOption.AMapLocationMode.Hight_Accuracy // 高精度模式
                interval = 5000 // 每5秒定位一次
                isNeedAddress = true // 是否需要返回地址信息
            }
            locationClient?.setLocationOption(option)
            locationClient?.setLocationListener(locationListener)
            locationClient?.startLocation()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * 定位结果回调
     */
    private val locationListener = AMapLocationListener { location ->
        if (location != null && location.errorCode == 0) {
            // 此处逻辑：将经纬度通过 Retrofit 发送到后端 PostgreSQL 数据库
            // 核心注释：原生开发可以确保即使在锁屏状态下，这段逻辑依然稳定运行
            val lat = location.latitude
            val lng = location.longitude
            println("骑手当前位置: $lat, $lng")
        }
    }

    private fun createNotification(): Notification {
        val channelId = "rider_location"
        val manager = getSystemService(NotificationManager::class.java)
        val channel = NotificationChannel(channelId, "配送定位服务", NotificationManager.IMPORTANCE_LOW)
        manager.createNotificationChannel(channel)

        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("配送员在线中")
            .setContentText("正在实时同步您的配送位置...")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        locationClient?.stopLocation()
        locationClient?.onDestroy()
        super.onDestroy()
    }
}
