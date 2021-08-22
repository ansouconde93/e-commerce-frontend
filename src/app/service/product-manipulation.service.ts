import { HttpEventType, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../model/Product';
import { AuthenticationService } from './authentication.service';
import { CaddyService } from './caddy.service';
import { ECommService } from './eComm.service';

@Injectable({
  providedIn: 'root'
})
export class ProductManipulationService {
 
  public editePhoto: any;
  public produitCourant: any;
  public electFiles: any;
  public progress: any;
  public currentFileUpload: any;
  public uploadBnt= 0;
  public timeStand: any;
  public produitQuantite: Product = new Product();
  public recurissivityControle = 0;

  constructor(public eCommService: ECommService,
    private caddyService: CaddyService, 
    private router: Router,
    public authenticationService: AuthenticationService) { }

  public getTS(){
    return this.timeStand;
  }

  public editerPhoto(prod: Product){
    this.editePhoto = true;
    this.produitCourant = prod;
    this.uploadBnt =0;
  }

 public selectedFile(event:any){
    this.electFiles = event.target.files;
    this.uploadBnt =1;
  }

  public uploadPhoto(){
    this.progress = 0;
    this.currentFileUpload = this.electFiles.item(0);
    this.eCommService.uploadPhoto(this.currentFileUpload, this.produitCourant.idproduct)
      .subscribe(response =>{
        if(response.type === HttpEventType.UploadProgress){
          if(response.total != undefined && response.total !=0){
            this.progress = Math.round(100* response.loaded / response.total);
            if(this.progress ==100){  
              this.timeStand = Date.now();        
              this.editePhoto = false;
              this.uploadBnt =0;
            }
          }
        }else if (response instanceof HttpRequest){
          this.editePhoto = false;
          this.uploadBnt =0;
        }
      }, err=>{//access token is expired or not valid, refresh it immediatly by using refresh token
            
        //Verify if user need to subscrib before that means if user have refresh token
        if(this.authenticationService.getUserRefreshToken() != null &&
          this.authenticationService.getUserRefreshToken() != undefined){
            this.authenticationService.generateAccessTokenFromRefreshToken()
              .subscribe(tokens =>{
                if(tokens!=null && tokens != undefined){
                  this.recurissivityControle ++;
                  if(this.recurissivityControle <2 ){
                    //save user access token in local storage
                    this.authenticationService.saveTokenLocalStorage(tokens.authorization);
                    //save save refresh token in local store
                    this.authenticationService.saveRefreshTokenLocalStorage(tokens.refreshToken);
                    // restarte upload photo method
                    this.uploadPhoto();
                  }else{
                    this.authenticationService.removeAuthenticatedUserToken();
                    this.authenticationService.removeUserRefreshToken();
                    this.recurissivityControle = 0;
                    this.router.navigateByUrl("/login/0");
                  }
                }else{// response is null => the next refresh token is null          
                  this.router.navigateByUrl("/login/0");
                }
              }, err =>{// refresh token is not valid        
              this.router.navigateByUrl("/login/0");
            }
          );
        }else{
          //if user never subscrib then redirect it to login form
          this.router.navigateByUrl("/login/0");
        }
      }
    );
  }
  
  public addCard(prod: Product){
    this.caddyService.addProductToCaddy(prod);
  }
  
}
