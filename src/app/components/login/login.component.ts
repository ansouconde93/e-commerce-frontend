import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Client } from 'src/app/model/Client';
import { Payment } from 'src/app/model/Payment';
import { Roles } from 'src/app/model/Roles';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { CaddyService } from 'src/app/service/caddy.service';
import { CommandeService } from 'src/app/service/commande.service';
import { ECommService } from 'src/app/service/eComm.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public invalide: boolean = false;
  public actionToDo:number = 0;
  public controleAction: any;
  tentativeConnexion =0;
  public typeCarte : string[]  = ["Carte Bancaire","Carte Visa","Master Card","Carte e-Dinar","Carte Jeune"]
  /**
   *  for which part of component will display. 
   * mode=0 => conexion & inscription, 
   * mode = 1 => display recap of order
   * mode = 2 => display order is saving in data base
   * mode = 3 => display paied form to give credit card information
   * mode = 4 => display paied informations
   */
  public mode: number = 0;
  public validedButton: string = "S'inscrire";
  public dataSource: any[] = [];
  public displayedColumns: string[] = ['id', 'name', 'quantite', 'price','remise'];
  public client : Client = new Client();
  public paymenCardInfo : Payment = new Payment();
  public middleMode: number = 0;

  constructor(private authenticationService: AuthenticationService,
     private route: Router,
     private caddyService: CaddyService,
     public commandeService: CommandeService,
     private activatedRoute: ActivatedRoute,
     private ecommService: ECommService) { }

  ngOnInit(): void {
    this.actionToDo = this.activatedRoute.snapshot.params.id; 
    //if client exite
    if(this.authenticationService.username ==null || this.authenticationService.username == undefined){
      if(this.actionToDo == 1){//when client click on commander buttom      
        this.validedButton = "Suivant";
      }else if(this.actionToDo == 0){//when client click on login buttom
        this.validedButton ="S'inscrire";
      }else{//not a needed route
        this.route.navigateByUrl("/products");
      }
    }else{
      this.getClientByUsername(); 
    }    
  }
  
  public onLogin(client: any){
    this.tentativeConnexion++;
    let user: Client = new Client();
    user.username = client.username;
    user.password = client.password;    
    user.name = client.name;
    user.phoneNumber = client.phoneNumber;
    user.address = client.address;
    user.country = client.country;
    user.zipCode = client.zipCode;
    user.roles = client.roles;
    this.authenticationService.onLogin(user)!
      .subscribe(reponse =>{
        if(reponse!=null){
          let jwt = reponse.headers.get('Authorization');
          this.authenticationService.saveTokenLocalStorage(jwt);
          //save save refresh token in local store
          this.authenticationService.saveRefreshTokenLocalStorage(reponse.headers.get('RefreshToken'));         
          if(this.actionToDo == 1){//when user want to buy product
            this.ecommService.postRessource("/client",user.username)
              .subscribe(u =>{
                this.client = u;
                this.caddyService.caddies.get(this.caddyService.currentCaddyName)!.client = this.client;
                //resave caddies after changing one caddy client.
                this.caddyService.saveCaddiesLocalStorage();
                this.commandeService.commande.client = this.client;
                this.commandeService.loadCommandeFromCaddy();
                this.getOrderContainer();            
                this.mode = 1;// display commande recap
              }, err =>{
                alert("Erreur pour faire la commande en ce moment ...");
                this.route.navigateByUrl("/products");
              }
            );
          }else{
             // go to home page after user authentification
            this.route.navigateByUrl("/products");
          }
        }else{
          alert("Inscrivez vous .");
          if(this.tentativeConnexion >3){
            alert("Désolé vous ne pouvez pas vous connecter maintenant !");
            this.route.navigateByUrl("/products");
          }
        }
      }, err =>{        
        alert("Incrivez vous d'abord !");
        this.actionToDo =0;
      }
    );
  }
  /**
   * add client in data base
   */
  public onAddCLient(client: any){
    this.client.name = client.name;
    this.client.phoneNumber = client.phoneNumber;
    this.client.address = client.address;
    this.client.country = client.country;
    this.client.zipCode = client.zipCode;
    this.client.username = client.username;
    this.client.password = client.password;
    if(client.roleUser == true){
      let role: Roles = new Roles();
      role.nomrole="user";
      this.client.roles.push(role);
    }
    if(client.roleAdmin == true){
      let role: Roles = new Roles();
      role.nomrole="admin";
      this.client.roles.push(role);
    }
    if(client.roleUser == false && client.roleAdmin == false){
      let role: Roles = new Roles();
      role.nomrole="user";
      this.client.roles.push(role);
    }
    //save client
    this.ecommService.postClient("/client/save",this.client)
      .subscribe(clt =>{
        this.client = client;
        this.onLogin(this.client);
      }, err=>{
        alert("Erreur d'inscription du cient");
        this.route.navigateByUrl("products");
      }
    );
  }
/**
 * prepare order data to display in table view
 */
  public getOrderContainer(){
    this.dataSource = [];
    if(this.commandeService.commande && this.commandeService.commande.productItems){
      this.commandeService.commande.productItems.forEach((item)=>{
        let v = {"id":item.product.idproduct,"name":item.product.name,"quantite": item.quantite,"price":item.price,"remise":item.remise};
        this.dataSource.push(v); 
      });
    }
  }
/**
 *  go to paied form 
 */
  public gotToPaiedForm(){
    this.controleAction = this.mode;
    this.mode = 3;
  }
  /**
   * save order in data base
   */
  public gotToSaveOrder(actionToDO: number){
    this.commandeService.commande.payment = this.paymenCardInfo;
    this.commandeService.SaveOrder(actionToDO);
    this.getOrderContainer();
    this.mode = 2;
  }
  /**
   * go to home page to visit new product
   */
  public gotToHomePage(){
    this.route.navigateByUrl("products");
  }
  /**readCardInformation
   * display card informations
   */
  public readCardInformation(cardInformation :any){
    if(this.mode==3){
      this.paymenCardInfo.amount = cardInformation.amount;
      this.paymenCardInfo.cardNumber = cardInformation.cardNumber;
      this.paymenCardInfo.cardPassword = cardInformation.cardPassword;
      this.paymenCardInfo.cardType = cardInformation.cardType;
      this.middleMode =1;
      this.mode = 4
    }
  }
  public saveCommande(){
      this.gotToSaveOrder(this.controleAction);
  }
  
  /**
   * get client by his username
   */
  public getClientByUsername(){
    this.ecommService.postRessource("/client",this.authenticationService.username)
      .subscribe(user=>{
        this.client = user;
        if(this.actionToDo == 1){
          this.commandeService.loadCommandeFromCaddy(); 
          this.getOrderContainer();         
          this.mode = 1;
        }else{
          alert("Vous êtes dejà inscrit");
          this.route.navigateByUrl("products");
        }
      }, err=>{ //access token is expired or not valid, refresh it immediatly by using refresh token                
          //Verify if user need to subscrib before that means if user have refresh token
      if(this.authenticationService.getUserRefreshToken() != null &&
      this.authenticationService.getUserRefreshToken() != undefined){
      this.authenticationService.generateAccessTokenFromRefreshToken()
        .subscribe(tokens =>{
          if(tokens!=null && tokens != undefined){
            //save user access token in local storage
            this.authenticationService.saveTokenLocalStorage(tokens.authorization);
              //save save refresh token in local store
            this.authenticationService.saveRefreshTokenLocalStorage(tokens.refreshToken);
              // restarte geting  method
            this.getClientByUsername();
        }else{// response is null => the next refresh token is null
          this.actionToDo = 0;
        }
      }, err =>{// refresh token is not valid 
        this.actionToDo = 0;
      }
      );
      }else{
        //if user never subscrib then redirect it to login form
        this.actionToDo = 0;
      } 

      }
    );
      
  }
}
