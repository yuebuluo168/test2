package com.appstudio.delivery;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.AppCompatContext;

/**
 * MainActivity - 安卓应用主入口
 * 
 * 核心功能：
 * 1. 初始化安卓原生环境
 * 2. 动态申请手机核心权限（摄像头、定位、存储）
 * 3. 挂载高德地图原生 SDK
 */
public class MainActivity extends AppCompatActivity {

    // 定义需要申请的权限列表
    private static final String[] REQUIRED_PERMISSIONS = {
        Manifest.permission.ACCESS_FINE_LOCATION, // 精准定位
        Manifest.permission.CAMERA,               // 摄像头
        Manifest.permission.RECORD_AUDIO,         // 麦克风
        Manifest.permission.WRITE_EXTERNAL_STORAGE // 文件存储
    };
    private static final int PERMISSION_REQUEST_CODE = 1001;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 检查并申请权限
        checkAndRequestPermissions();
        
        // 在此处初始化高德地图隐私协议（合规要求）
        // MapsInitializer.updatePrivacyShow(this, true, true);
        // MapsInitializer.updatePrivacyAgree(this, true);
    }

    /**
     * 检查手机权限
     * 如果权限未授予，则弹出系统授权对话框
     */
    private void checkAndRequestPermissions() {
        boolean allGranted = true;
        for (String permission : REQUIRED_PERMISSIONS) {
            if (ActivityCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }

        if (!allGranted) {
            ActivityCompat.requestPermissions(this, REQUIRED_PERMISSIONS, PERMISSION_REQUEST_CODE);
        }
    }

    /**
     * 权限申请结果回调
     */
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "权限已授予，系统启动中", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "请授予必要权限以保证配送功能正常", Toast.LENGTH_LONG).show();
            }
        }
    }
}
