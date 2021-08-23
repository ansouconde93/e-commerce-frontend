import { HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../model/Category';
import { Client } from '../model/Client';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class ECommService {

  public host: string = "https://ecom-application.herokuapp.com";// "http://localhost:3002";
  
  constructor(private http: HttpClient,
    private authenticationService: AuthenticationService) {}

  public getRessource(url:any){
     return this.http.get(this.host+url);
  } 

  public postRessource(url:string, ressources: any){
    let token = this.authenticationService.getAuthenticatedUserToken();
    return this.http.post<any>(this.host+url, ressources,{
      headers: new HttpHeaders(
        {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
          'Access-Control-Allow-Credentials': true,
          'Origin':'https://ecom-user-interface.herokuapp.com'
          'Access-Control-Allow-Headers': 'Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization',
          'Access-Control-Expose-Headers': 'Access-Control-Allow-Origin, Access-Control-Allow-Credentials, Authorization,RefreshToken',
          'Authorization':token
        }
      )
    });
 } 
/**
 * get products by user given key word 
 */
 public getProductsByKeyWord(keyWord: string){
  return this.http.post<Category>(this.host+"/product/keyword", keyWord);
} 
 //saving client in db not need authentification
 public postClient(url:string, ressources: Client){
  return this.http.post<Client>(this.host+url, ressources);
} 
  
 public deleteRessource(url:any){
  let token = this.authenticationService.getAuthenticatedUserToken();
  return this.http.delete(this.host+url,{
    headers: new HttpHeaders(
      {
        'Authorization':token
      }
    )
  });
 } 

  uploadPhoto(currentFileUpload: File, idProuct: any): Observable <HttpEvent<{}>> {
    let token = this.authenticationService.getAuthenticatedUserToken();
    let formatData: FormData = new FormData();
    formatData.append('file',currentFileUpload);
    const req = new HttpRequest('POST',this.host+'/uploadPhotoProduct/'+idProuct, formatData,{
      reportProgress :true,
      responseType :'text',
      headers: new HttpHeaders({'Authorization':token})
    });
    return this.http.request(req)
  }
}
