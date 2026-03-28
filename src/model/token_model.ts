//1.0 vision，localStorage 中存取的 token 資料結構
// export interface tokenModel {
//     Access_Token: string;
//     Refresh_Token: string;
//     Access_Token_Expire_Time: number;   // Unix timestamp
//     Refresh_Token_Expire_Time: number; // Unix timestamp
// }


//2.0 vision，cookies 中存取的 token 資料結構
// Access Token: 放在 記憶體 (Signal) 中，供 API 呼叫使用。

// Refresh Token: 由後端寫入 HttpOnly Cookie，瀏覽器自動保管
// ，前端無法直接存取，增加安全性。

export interface tokenModel {
  Access_Token: string;
  Access_Token_Expire_Time: number;
  Role: string; 
}