import { Component,inject,signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../service/auth.js';
import { DatePipe } from '@angular/common' ;

//正式環境建議儲存位置：
//Access token → memory only
//Refresh token → httpOnly cookie

@Component({
  selector: 'app-login',
  imports: [DatePipe],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  standalone: true
})
export class Login {

  authService = inject(AuthService);
  http = inject(HttpClient);

  login_API_URL = 'https://localhost:7079/api/Auth/Login';
  api_test_token_Expired_URL = 'https://localhost:7079/api/Auth/TEST_API';
  Api_Message = signal<string>('Loading...');
  
  
  user_account = signal<string>('');

  login(): void {
    this.http.post<any>(this.login_API_URL, {
      username: this.user_account(),
      password: 'testpassword'
    }).subscribe({
      next: (response) => {
        console.log('API 回傳', response); 
        this.authService.updateToken(response);
        this.Api_Message.set('Login successful!');
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.Api_Message.set('Login failed. Please try again.');
      }
    });

  }

  call_api_test_token_Expired(): void {

    this.http.post<any>(this.api_test_token_Expired_URL, {}).subscribe({
      next: (response) => {
        this.Api_Message.set('API call successful: ' + response.message);
      },
      error: (error) => {
        console.error('API call failed:', error);

        const message =
          error?.error?.message ||
          error?.message ||
          '未知錯誤';

        this.Api_Message.set(
          'API 呼叫失敗，Refresh Token 也過期了。 ' + message
        );
      }
    });

  }

  api_test_role_URL = 'https://localhost:7079/api/Auth/TEST_Role_API';
  call_api_test_role(): void {

    this.http.post<any>(this.api_test_role_URL, {}).subscribe({
      next: (response) => {
        this.Api_Message.set('API call successful: ' + response.message);
      },
      error: (error) => {
          console.error('API call failed:', error);
        // 角色控管核心邏輯：
          // 401 代表 Token 過期 (攔截器會處理)
          // 403 代表「你是本人，但你角色不對」
          if (error.status === 403) {
        
            this.Api_Message.set('【拒絕存取】你的角色權限不足以執行此操作！');
          } else {
             this.Api_Message.set('API call failed: ' + error?.error?.message || error?.message || '未知錯誤');
          }
      }
    });
  }

}
