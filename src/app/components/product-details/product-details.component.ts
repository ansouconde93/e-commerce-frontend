import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'src/app/model/Category';
import { Product } from 'src/app/model/Product';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { ECommService } from 'src/app/service/eComm.service';
import { ProductManipulationService } from 'src/app/service/product-manipulation.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
  productToDetail: any;
  actionToDo: number = 0;
  public category: Category = new Category();
  public categories: any;
  public newProduct: Product = new Product();
  public isProductAdded: boolean = false;
  choosePhotoNow: boolean = false;
  statusDelete: any;
  isDataCorrect: boolean = true;
  public dataWaitingControl =0;
  public recurissivityControle = 0;

  constructor(public eCommService: ECommService, 
    public authenticationService: AuthenticationService,
    public productManipulationService: ProductManipulationService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.getProductToDetails();
  }
  
  public getProductToDetails(){
    let idProduit = this.activatedRoute.snapshot.params.id;
    this.eCommService.getRessource("/product/"+idProduit)
      .subscribe(product =>{
        this.productToDetail = product;
        this.dataWaitingControl = 1;
        if(this.productToDetail == null){          
        this.router.navigateByUrl("products");
        }
      },err =>{
        alert("Error: this product can't detail at the moment!");
        this.router.navigateByUrl("products");
      }
    );
  }

  public goToHomePage(){
    this.router.navigateByUrl("products");
  }

  public switchBetweenActions(flagEditOrAddNewProduct: number){
    this.actionToDo = flagEditOrAddNewProduct;
    if(this.actionToDo != 3)
      this.getCategories();
  }

  public getCategories(){
    this.dataWaitingControl =0;
    this.eCommService.getRessource("/categories")
      .subscribe(cats =>{
        this.categories = cats;
        this.dataWaitingControl = 1;
      }, err=>{
        alert("Error: This product can't edit at the moment !");
        this.router.navigateByUrl("products");
      }
    );
  }

  /*
    this function can update or add new product in data base.
    if the flag actionFlag = 0 mean the role of the function is updating product else it is adding a new product
  */
  public updateOrAddNewProduct(actionFlag: number){
    if(actionFlag ==0){// if it is updating functionnality
      //verify if new product informations are correct 
      if(this.productToDetail.name == null ||
        this.productToDetail.description == null ||
        this.productToDetail.price == null ||
        this.productToDetail.price < 0){
          this.isDataCorrect = false;
      }else{//add new product
        this.updateOrSaveProduct(this.productToDetail);            
        this.actionToDo = 0;
        this.isDataCorrect = true;
      }
    }else if(actionFlag==1){// if it is adding functionnality
      this.newProduct.idproduct = null
      this.newProduct.photoname = this.newProduct.name;
      this.newProduct.quantite=1;
      //verify if new product informations are correct 
      if(this.newProduct.category == null ||
        this.newProduct.name == null ||
        this.newProduct.description == null ||
        this.newProduct.price == null ||
        this.newProduct.price < 0){
          this.isDataCorrect = false;
      }else{//add new product
        this.updateOrSaveProduct(this.newProduct);
        this.isDataCorrect = true;
      }
    }    
  }
 
public updateOrSaveProduct(product: Product){
  this.eCommService.postRessource("/product/save",product)!
    .subscribe(product =>{
      this.productToDetail = product;
        //this is for just added functionnality
      this.isProductAdded = true;
    }, err=>{//access token is expired or not valid, refresh it immediatly by using refresh token
        
        //Verify if user need to subscrib before that means if user have refresh token
        if(this.authenticationService.getUserRefreshToken() != null &&
          this.authenticationService.getUserRefreshToken() != undefined){
            this.authenticationService.generateAccessTokenFromRefreshToken()
              .subscribe(tokens =>{
            if(tokens!=null && tokens != undefined){
              this.recurissivityControle ++;
              if(this.recurissivityControle <2){
                //save user access token in local storage
                this.authenticationService.saveTokenLocalStorage(tokens.authorization);
                //save save refresh token in local store
                this.authenticationService.saveRefreshTokenLocalStorage(tokens.refreshToken);
                // restarte save order method
                this.updateOrSaveProduct(product);
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

  //function to activate flag choosePhotoNow
  public goToChoosePhoto(){
    this.choosePhotoNow = true;
  }
  /*
    function to add photo
   */
  public addPhotoToNewProduct(){
    this.productManipulationService.produitCourant = this.productToDetail;
    this.productManipulationService.uploadPhoto()
    this.router.navigateByUrl("products");
  }

  //delete now
  public deleteNow(idProduit: number){
    this.eCommService.deleteRessource("/product/delete/"+idProduit)!.subscribe(response =>{
      this.router.navigateByUrl("products");      
    }, err=>{//access token is expired or not valid, refresh it immediatly by using refresh token
                
        //Verify if user need to subscrib before that means if user have refresh token
        if(this.authenticationService.getUserRefreshToken() != null &&
          this.authenticationService.getUserRefreshToken() != undefined){
            this.authenticationService.generateAccessTokenFromRefreshToken()
            .subscribe(tokens =>{
              if(tokens!=null && tokens != undefined){
                this.recurissivityControle ++;
                if(this.recurissivityControle <2){
                  //save user access token in local storage
                  this.authenticationService.saveTokenLocalStorage(tokens.authorization);
                  //save save refresh token in local store
                  this.authenticationService.saveRefreshTokenLocalStorage(tokens.refreshToken);
                  // restarte delete method
                  this.deleteNow(idProduit);
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
