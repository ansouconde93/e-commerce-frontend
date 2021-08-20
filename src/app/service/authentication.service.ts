import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { JwtHelperService } from "@auth0/angular-jwt";
import { Client } from '../model/Client';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  public host: string = "https://ecom-application.herokuapp.com";// "http://localhost:3002";
  public isAdmin = false;
  public username: string ="";

  constructor(private http: HttpClient,
    private router: Router) {
      this.decodeUserAccesToken();
     }

  public onLogin(user:any){
    /*
    {observe:'response'} spring security n'avoie pas le format json, et on ne veux pas le format json ici
    */
    if(user == null){
      return null;
    }
    return this.http.post(this.host+ '/login', user,{observe:'response'});
  }
  //save token: it is access token
  public saveTokenLocalStorage(jwt: any){
    localStorage.setItem("authenticatedUser",jwt);
  }
  //get authenticated user token: it is access token 
  public getAuthenticatedUserToken(): any{
    return localStorage.getItem("authenticatedUser");
  }
  // For refresh token
  public generateAccessTokenFromRefreshToken(){
    let refreshToken: string = this.getUserRefreshToken();
    return this.http.post<any>(this.host+ '/client/token/refresh', refreshToken);
  }
  //save refresh token
  public saveRefreshTokenLocalStorage(jwt: any){
    localStorage.setItem("refreshToken",jwt);
  }
  //get refresh token  
  public getUserRefreshToken(): any{
    return localStorage.getItem("refreshToken");
  }
  /**
   * decoding user access token
   */
  public decodeUserAccesToken(){
    let accessToken: string= this.getAuthenticatedUserToken();
    if(accessToken!=null){
      accessToken = accessToken.replace("Bearer ","");//remove header Bearer
      const helper = new JwtHelperService();
      const decodedToken = helper.decodeToken(accessToken);
      this.username = decodedToken.sub;
      for(let i = 0; i < decodedToken.roles.length; i++ ){
        if(decodedToken.roles[i].authority == "admin"){
          this.isAdmin = true;
          break;
        }
      }
    }
  }
}
