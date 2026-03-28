//1.0 vision localStorage 存取 token 資料，並提供更新與清除的功能
// import { Component,inject,signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { AuthService } from '../../service/auth.js';
// import { DatePipe } from '@angular/common' ;


// @Component({
//   selector: 'app-login',
//   imports: [DatePipe],
//   templateUrl: './login.html',
//   styleUrls: ['./login.css'],
//   standalone: true
// })
// export class Login {

//   authService = inject(AuthService);
//   http = inject(HttpClient);

//   login_API_URL = 'https://localhost:7079/api/Auth/Login';
//   api_test_token_Expired_URL = 'https://localhost:7079/api/Auth/TEST_API';
//   Api_Message = signal<string>('Loading...');
  
  
//   user_account = signal<string>('');

//   login(): void {
//     this.authService.logout(); // 確保每次登入前都清除舊的 token 資料

//     this.http.post<any>(this.login_API_URL, {
//       username: this.user_account(),
//       password: 'testpassword'
//     }).subscribe({
//       next: (response) => {
//         console.log('API 回傳', response); 
//         this.authService.updateToken(response);
//         this.Api_Message.set('Login successful!');
//       },
//       error: (error) => {
//         console.error('Login failed:', error);
//         this.Api_Message.set('Login failed. Please try again.');
//       }
//     });

//   }

//   call_api_test_token_Expired(): void {

//     this.http.post<any>(this.api_test_token_Expired_URL, {}).subscribe({
//       next: (response) => {
//         this.Api_Message.set('API call successful: ' + response.message);
//       },
//       error: (error) => {
//         console.error('API call failed:', error);

//         const message =
//           error?.error?.message ||
//           error?.message ||
//           '未知錯誤';

//         this.Api_Message.set(
//           'API 呼叫失敗，Refresh Token 也過期了。 ' + message
//         );
//       }
//     });

//   }

//   api_test_role_URL = 'https://localhost:7079/api/Auth/TEST_Role_API';
//   call_api_test_role(): void {

//     this.http.post<any>(this.api_test_role_URL, {}).subscribe({
//       next: (response) => {
//         this.Api_Message.set('API call successful: ' + response.message);
//       },
//       error: (error) => {
//           console.error('API call failed:', error);
//         // 角色控管核心邏輯：
//           // 401 代表 Token 過期 (攔截器會處理)
//           // 403 代表「你是本人，但你角色不對」
//           if (error.status === 403) {
        
//             this.Api_Message.set('【拒絕存取】你的角色權限不足以執行此操作！');
//           } else {
//              this.Api_Message.set('API call failed: ' + error?.error?.message || error?.message || '未知錯誤');
//           }
//       }
//     });
//   }

// }

//--------------------------------------------------------------

//2.0 vision，改為使用 cookies 存取 Refresh Token，
// Access Token 則放在記憶體中 (Signal)，增加安全性
//正式環境建議儲存位置：
//Access token → memory only
//Refresh token → httpOnly cookie

import { Component,inject,signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../service/auth.js';
import { DatePipe } from '@angular/common' ;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  authService = inject(AuthService);
  http = inject(HttpClient);

  baseUrl = 'https://localhost:7079/api/Auth';
  api_test_token_Expired_URL = 'https://localhost:7079/api/Auth/TEST_API';
  user_account = signal<string>('');
  Api_Message = signal<string>('等待中...');


  login(): void {
    this.authService.logout();

    // 呼叫 Login 時不需要特別設定，但後端會回傳 Set-Cookie
    //啟用 withCredentials
    // 當使用 Cookie 時，Angular 的 HttpClient 必須開啟 withCredentials: true，
    // 否則瀏覽器為了安全，不會自動發送 Cookie。
    
    this.http.post<any>(`${this.baseUrl}/Login`, {
      username: this.user_account(),
      password: 'testpassword'
    }, { withCredentials: true }).subscribe({ 
      next: (response) => {
        this.authService.updateToken(response);
        this.Api_Message.set('登入成功！');
      },
      error: (err) => this.Api_Message.set('登入失敗')
    });
  }

  // 測試刷新邏輯 (這就是你原本 call_api_test_token_Expired 的 Cookie 版)
  call_api_test_token_Expired(): void {
    // 💡 即使 Access Token 過期，Interceptor 會自動用 Cookie 去刷新
    this.http.post<any>(this.api_test_token_Expired_URL, {}, { withCredentials: true }).subscribe({
      next: (res) => {
        this.Api_Message.set(`[驗證成功] ${res.message}\n注意看 Access Token 過期時間是否已更新！`);
      },
      error: (err) => {
        this.Api_Message.set('驗證失敗：Refresh Token 已失效，請重新登入。');
        this.authService.logout();
      }
    });
  }

  // 測試 API 時也需要 withCredentials
  call_api_test_role(): void {
    this.http.post<any>(`${this.baseUrl}/TEST_Role_API`, {}, { 
      withCredentials: true 
    }).subscribe({
      next: (res) => this.Api_Message.set('成功：' + res.message),
      error: (err) => {
        if (err.status === 403) this.Api_Message.set('【拒絕】權限不足');
        else this.Api_Message.set('呼叫失敗');
      }
    });
  }
}