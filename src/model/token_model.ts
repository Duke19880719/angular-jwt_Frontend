export interface tokenModel {
    Access_Token: string;
    Refresh_Token: string;
    Access_Token_Expire_Time: number;   // Unix timestamp
    Refresh_Token_Expire_Time: number; // Unix timestamp
}