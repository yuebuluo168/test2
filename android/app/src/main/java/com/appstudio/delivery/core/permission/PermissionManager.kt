package com.appstudio.delivery.core.permission

import android.content.Context
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.core.content.ContextCompat

/**
 * PermissionManager - 安卓原生权限管理类
 * 
 * 核心功能：
 * 1. 封装安卓 6.0+ 的动态权限申请逻辑
 * 2. 核心代码中文注释，确保开发者理解每一项权限的必要性
 */
object PermissionManager {

    // 平台所需的全部核心权限
    val REQUIRED_PERMISSIONS = arrayOf(
        android.Manifest.permission.ACCESS_FINE_LOCATION,   // 精准定位：骑手轨迹追踪核心
        android.Manifest.permission.ACCESS_COARSE_LOCATION, // 模糊定位：辅助定位
        android.Manifest.permission.CAMERA,                 // 摄像头：身份证拍照、人脸识别
        android.Manifest.permission.RECORD_AUDIO,           // 麦克风：内置语音聊天
        android.Manifest.permission.READ_PHONE_STATE,       // 读取手机状态：用于设备唯一标识
        android.Manifest.permission.CALL_PHONE              // 拨打电话：直接联系商家/顾客
    )

    /**
     * 在 Compose 环境中请求权限的辅助函数
     */
    @Composable
    fun RequestAllPermissions(onAllGranted: () -> Unit) {
        val launcher = rememberLauncherForActivityResult(
            contract = ActivityResultContracts.RequestMultiplePermissions()
        ) { permissions ->
            val allGranted = permissions.values.all { it }
            if (allGranted) {
                onAllGranted()
            }
        }

        SideEffect {
            launcher.launch(REQUIRED_PERMISSIONS)
        }
    }

    /**
     * 检查是否已拥有所有权限
     */
    fun hasAllPermissions(context: Context): Boolean {
        return REQUIRED_PERMISSIONS.all {
            ContextCompat.checkSelfPermission(context, it) == PackageManager.PERMISSION_GRANTED
        }
    }
}
