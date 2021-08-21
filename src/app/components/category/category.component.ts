import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from 'src/app/model/Category';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { ECommService } from 'src/app/service/eComm.service';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  categoryToDetail: any;
  actionToDo: number = 0;
  public category: Category = new Category();
  public categories: any;
  public newCategory: Category = new Category();
  public isCategoryAdded: boolean = false;
  isDataCorrect: boolean = true;
  public dataWaitingControl =0;

  constructor(public eCommService: ECommService, 
    public authenticationService: AuthenticationService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.getCategoryToDetails();
  }
  
  public getCategoryToDetails(){
    let idCategory = this.activatedRoute.snapshot.params.id;
    this.eCommService.getRessource("/category/"+idCategory)
      .subscribe(category =>{
        this.categoryToDetail = category;
        this.dataWaitingControl = 1;
        if(this.categoryToDetail == null){          
        this.router.navigateByUrl("products");
        }
      },err =>{
        alert("Error category can't details ");
        this.router.navigateByUrl("products");
      }
    );
  }

  public goToHomePage(){
    this.router.navigateByUrl("products");
  }

  public switchBetweenActions(flagEditOrAddNewProduct: number){
    this.actionToDo = flagEditOrAddNewProduct;
  }

  /*
    this function can update or add new category in data base.
    if the flag actionFlag = 0 mean the role of the function is updating category
     else it is adding a new category
  */
  public updateOrAddNewCategory(actionFlag: number){
    if(actionFlag ==0){// if it is updating functionnality
      //verify if category informations are correct 
      if(this.categoryToDetail.name == null ||
        this.categoryToDetail.description == null){
          this.isDataCorrect = false;
      }else{//updating
        console.log(this.categoryToDetail);
        this.updateOrSaveCategory(this.categoryToDetail);            
        this.actionToDo = 0;
        this.isDataCorrect = true;
      }
    }else if(actionFlag==1){// if it is adding functionnality
      this.newCategory.id = null
      this.newCategory.photo = this.newCategory.name;
      //verify if new category informations are correct 
      if(this.newCategory.name == null ||
        this.newCategory.description == null){
          this.isDataCorrect = false;
      }else{//add new product
        this.updateOrSaveCategory(this.newCategory);
        this.isDataCorrect = true;
      }
    }    
  }
 
public updateOrSaveCategory(category: Category){
  this.dataWaitingControl = 0;
  this.eCommService.postRessource("/category/save",category)!
    .subscribe(categ =>{
      console.log(this.categoryToDetail);
      console.log(categ);
      this.categoryToDetail = categ;
        //this is for just added functionnality
      this.isCategoryAdded = true;
      this.actionToDo = 0;
      this.dataWaitingControl = 1;
    }, err=>{//access token is expired or not valid, refresh it immediatly by using refresh token        
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
              // restarte save order method
              this.updateOrSaveCategory(category);
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

  
  //delete now
  public deleteNow(idCategory: number){
    this.eCommService.deleteRessource("/category/delete/"+idCategory)!.subscribe(response =>{
      this.router.navigateByUrl("products");      
    }, err=>{//access token is expired or not valid, refresh it immediatly by using refresh token                
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
                // restarte delete method
                this.deleteNow(idCategory);
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
