import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from 'src/app/model/Category';
import { Product } from 'src/app/model/Product';
import { AuthenticationService } from 'src/app/service/authentication.service';
import { ECommService } from 'src/app/service/eComm.service';
import { ProductManipulationService } from 'src/app/service/product-manipulation.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  public products: any;
  public categories: any;
  public categoriesTemp: any;
  public keyword: string = "";

  constructor(public eCommService: ECommService, 
    public authenticationService: AuthenticationService,
    public productManipulationService: ProductManipulationService,
    private router: Router) { }

  ngOnInit(): void {
    //fetch all categories with its products respectively
    this.getCategories();  
  }
  /**
   * get all categories
   */  
  public getCategories(){
    this.eCommService.getRessource("/categories")
      .subscribe(cats =>{
        this.categories = cats;
        this.categoriesTemp = this.categories;
      }, err=>{
        alert("Error: can't read categories !");
        this.router.navigateByUrl("products");
      }
    );
  }
  public getProducts(url: any): void{
    this.eCommService.getRessource(url)
    .subscribe(response=>{
      this.products = response;      
    }, err =>{
      alert("Error from fetching product in data base");
    });
  }  
  /**
   * detail product function
   */
  public detailProduit(idProduit: number){
    this.router.navigateByUrl("produt-details/"+idProduit);
  }
  /**
   * go to detail category
   */
  public goToDetailCategory(category: Category){
    this.router.navigateByUrl("category/"+category.id);
  } 
  /**
   * filter products by available, promotion and selcted products
  */
  public filterProductsByAvailablePromotionSelected(indice: number){
    this.keyword="";
    this.getAllCategories(); //load all categorie in categoriesTemp variable to categories variable
    let categ: Category[] = new Array();
    let currentProducts: Product[] = new Array();
    for(let cat of this.categories){
      for(let prod of cat.products){
        if(indice == 1){
          if(prod.avaible == true){
            currentProducts.push(prod);
          }
        }else if(indice == 2){
          if(prod.promotion == true){
            currentProducts.push(prod);
          }
        }else if(indice == 3){
          if(prod.selected == true){
            currentProducts.push(prod);
          }
        }
      }
      if(currentProducts.length >0){
        let c: Category = new Category();
        c.name = cat.name;
        c.id = cat.id;
        c.description = cat.description;
        c.photo = cat.photo;
        c.products = currentProducts;categ.push(c);
        currentProducts = new Array();
      }
    }
    this.categories = null;
    this.categories = categ;
  }
  /**
   * get all categories when user clic on All buttom
  */
  public getAllCategories(){
    this.keyword="";
    this.categories = null;
    this.categories = this.categoriesTemp;
  }
  /**
   * search product by key word
   */
  public searchProductByKeyWord(){
    if(this.keyword!=""){
      this.eCommService.getProductsByKeyWord(this.keyword)
        .subscribe(cat =>{
          this.categories = null;
          this.categories = cat;
        }, err=>{
          this.categories = this.categoriesTemp;
        }
      );
    }
  }
}
