import {HttpInterceptorFn,HttpErrorResponse} from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../service/auth';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tokenModel } from '../model/token_model';
//目標功能:攔截 401 並自動刷新 Token

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const http = inject(HttpClient);
    const api = 'https://localhost:7079/api/Auth/refresh'; //假設的刷新 Token API

    //檢查是否有 Token
    const current_access_token = authService.authToken()?.Access_Token; 
    let authReq = req;
    if (current_access_token) {
        authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${current_access_token}`
            }
        });
    }
    //處理錯誤更新token

    return next(authReq).pipe(
        catchError((error) => {

            if (error instanceof HttpErrorResponse && error.status === 401) {
                const token_data = authService.authToken();
                if (token_data ) {
                    return http.post<tokenModel>(api, {
                        Access_Token: token_data.Access_Token,
                        Refresh_Token: token_data.Refresh_Token
                    }).pipe(
                        switchMap((newTokenData) => {
                        //更新 Token    
                        authService.updateToken(newTokenData); 

                        //重新發送原始請求和加入新token到標頭
                        const newAuthReq = req.clone({
                            setHeaders: {
                                Authorization: `Bearer ${newTokenData.Access_Token}`
                            }
                        });
                        return next(newAuthReq);
                        }),
                        catchError((refreshError) => {
                            //refresh token 也失效，需要重新登入，執行登出
                            authService.logout();
                            return throwError(() => refreshError);
                        })
                    );
                }
            }  
            return throwError(() => error);

        })
    );

}