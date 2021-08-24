import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Commande } from '../model/Commande';
import { AuthenticationService } from './authentication.service';
import { CaddyService } from './caddy.service';
import { ECommService } from './eComm.service';

@Injectable({
  providedIn: 'root'
})
export class CommandeService {

  public commande: Commande = new Commande();
  public recurissivityControle = 0;
  //variable for waiting order id from data base using subscrib method
  public dataWaitingControl = 0;

  constructor(private caddyService: CaddyService,
    private eCommService: ECommService,
    private authenticationService: AuthenticationService,
    private router: Router) { }

  public loadCommandeFromCaddy(){
    this.commande.date=new Date();
    this.commande.productItems=[];
    for( let productItem of this.caddyService.caddies.get(this.caddyService.currentCaddyName)!.items.values()){
      this.commande.productItems.push(productItem);
    }
  }
  /**
   * get total of price
   */
  public getTotalPrice(): number{
    let totalPrice =0;
    let totalRemise = 0;
    if(this.commande && this.commande.productItems){
      this.commande.productItems.forEach((product)=>{
        totalPrice += product.price * product.quantite;
        totalRemise += product.remise;
      });
    }
    return totalPrice - totalRemise;
  }
   /**
   * get total of remise
   */
    public getTotalRemise(): number{
      let totalRemise = 0;
      if(this.commande && this.commande.productItems){
        this.commande.productItems.forEach((product)=>{
          totalRemise += product.remise;
        });
      }
      return totalRemise;
    }
  /**
   * save order in data base
   */
  public SaveOrder(action: number){
    this.eCommService.postRessource("/orders/"+action,this.commande)
      .subscribe(order =>{
        if(order != null && order != undefined){
          this.commande = order;
          if(action ==1 || action == 2){
            this.caddyService.caddies.get(this.caddyService.currentCaddyName)!.paied = true;
            this.caddyService.saveCaddiesLocalStorage();
            this.dataWaitingControl = 1;
          }
        }
      }, err =>{//access token is expired or not valid, refresh it immediatly by using refresh token
        //Verify if user need to subscrib before that means if user have refresh token
        if(this.authenticationService.getUserRefreshToken() != null &&
        this.authenticationService.getUserRefreshToken() != undefined){
          this.authenticationService.generateAccessTokenFromRefreshToken()
              .subscribe(tokens =>{
                if(tokens!=null && tokens != undefined){
                  this.recurissivityControle ++;
                  if(this.recurissivityControle < 2){
                    //save user access token in local storage
                    this.authenticationService.saveTokenLocalStorage(tokens.authorization);
                    //save save refresh token in local store
                    this.authenticationService.saveRefreshTokenLocalStorage(tokens.refreshToken);
                    // restarte save order method: recurssivity
                    this.SaveOrder(action);
                  }else{
                    this.authenticationService.removeAuthenticatedUserToken();
                    this.authenticationService.removeUserRefreshToken();
                    this.recurissivityControle =0;
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
}
