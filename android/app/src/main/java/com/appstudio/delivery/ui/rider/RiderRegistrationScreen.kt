package com.appstudio.delivery.ui.rider

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/**
 * RiderRegistrationScreen - 骑手注册原生 UI (Jetpack Compose 实现)
 * 
 * 核心功能：
 * 1. 采用现代声明式 UI 编写，性能远超传统 XML 和 WebView
 * 2. 包含身份证拍照、人脸识别的逻辑触发点
 */
@Composable
fun RiderRegistrationScreen(
    onRegisterSubmit: (RiderData) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var step by remember { mutableIntStateOf(1) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "骑手实名注册",
            style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.primary
        )

        if (step == 1) {
            // 基础信息输入
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("真实姓名") },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("手机号码") },
                modifier = Modifier.fillMaxWidth()
            )
            Button(
                onClick = { step = 2 },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("下一步：身份验证")
            }
        } else if (step == 2) {
            // 身份验证逻辑
            Text("请上传身份证正反面照片", style = MaterialTheme.typography.bodyLarge)
            
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(onClick = { /* 调用原生摄像头拍照 */ }, modifier = Modifier.weight(1f)) {
                    Text("拍摄正面")
                }
                Button(onClick = { /* 调用原生摄像头拍照 */ }, modifier = Modifier.weight(1f)) {
                    Text("拍摄反面")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
            
            Button(
                onClick = { /* 执行人脸识别 SDK 逻辑 */ },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondary)
            ) {
                Text("开始人脸识别")
            }
            
            OutlinedButton(
                onClick = { step = 1 },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("返回修改")
            }
        }
    }
}

data class RiderData(val name: String, val phone: String)
