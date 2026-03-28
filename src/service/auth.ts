//1.0 vision localStorage 存取 token 資料，並提供更新與清除的功能

// import { tokenModel } from '../model/token_model';
// import { Injectable,signal,computed } from '@angular/core';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//     private _authToken = signal<tokenModel | null>(
//         this.loadToken()
//     );

//     //TypeScript 允許「在宣告時直接賦值」，而且會自動推導型別
//     authToken = this._authToken.asReadonly();

//     private loadToken(): tokenModel | null {
//         try {
//         const raw = localStorage.getItem('token_data');
//         if (!raw || raw === 'undefined') return null;
//         return JSON.parse(raw);
//         } catch {
//         return null;
//         }
//     }



//     updateToken(tokenData: tokenModel){
//         this.logout(); // 清除舊的 token 資料

//         localStorage.setItem('token_data',JSON.stringify(tokenData));
//         this._authToken.set(tokenData);
//     }

//     logout(){
//         localStorage.removeItem('token_data');
//         this._authToken.set(null); //讓攔截器抓到 null，不再掛載舊 Header
//     }

// }



//--------------------------------------------------------------
//2.0 vision 改為使用 cookies 存取 Refresh Token，
// Access Token 則放在記憶體中 (Signal)，增加安全性
import { tokenModel } from '../model/token_model';
import { Injectable,signal,computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private _authToken = signal<tokenModel | null>(null);

    authToken = this._authToken.asReadonly();

    updateToken(tokenData: tokenModel){
        this._authToken.set(tokenData);
    }

    logout(){
        this._authToken.set(null); //讓攔截器抓到 null，不再掛載舊 Header
    }
}