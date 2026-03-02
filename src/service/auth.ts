import { tokenModel } from '../model/token_model';
import { Injectable,signal,computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private _authToken = signal<tokenModel | null>(
        this.loadToken()
    );

    //TypeScript 允許「在宣告時直接賦值」，而且會自動推導型別
    authToken = this._authToken.asReadonly();

    private loadToken(): tokenModel | null {
        try {
        const raw = localStorage.getItem('token_data');
        if (!raw || raw === 'undefined') return null;
        return JSON.parse(raw);
        } catch {
        return null;
        }
    }



    updateToken(tokenData: tokenModel){
        localStorage.setItem('token_data',JSON.stringify(tokenData));
        this._authToken.set(tokenData);
    }

    logout(){
        localStorage.removeItem('token_data');
        this._authToken.set(null);
    }

}