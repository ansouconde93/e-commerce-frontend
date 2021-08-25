import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CaddyService } from 'src/app/service/caddy.service';

@Component({
  selector: 'app-caddy',
  templateUrl: './caddy.component.html',
  styleUrls: ['./caddy.component.css']
})
export class CaddyComponent implements OnInit {

  public dataSource: any[] = [];
  displayedColumns: string[] = ['id', 'name', 'quantite', 'price','remise'];
  public caddiesName : string[]=[];  
  public totalOfAllNoPaiedCaddies = 0;
  public totalOfAllPaiedCaddies = 0;
  public productToDelete: any[] = [];
  public currentCadyIsNull = true;

  constructor(public caddyService: CaddyService,
    private router: Router) { }

  ngOnInit(): void {
    this.getCaddiesName();
    this.getCurrentCaddy();
    this.getTotalOfAllNoPaiedCaddies();
    if(this.caddyService.caddies.get(this.caddyService.currentCaddyName) ||
    this.caddyService.caddies.get(this.caddyService.defaultCaddyName)){
      this.currentCadyIsNull = false;
    }
  }

  public goToHomePage(){
    this.router.navigateByUrl("products")
  }

  public getCurrentCaddy(){
    let caddy = this.caddyService.caddies.get(this.caddyService.currentCaddyName);
  if(caddy){
      for(let value of caddy!.items.values()){
        let v = {"id":value.product.idproduct,"name":value.product.name,"quantite": value.quantite,"price":value.price,"remise":value.remise};
        this.dataSource.push(v);      
      }
    }
  }
  /**
   * function to delete this caddy
   */
  public deleteCurentCaddy(){
    this.caddyService.deleteCurrentCaddyLocalStorage();
    this.dataSource=[];
    this.getTotalOfAllNoPaiedCaddies();
    this.getTotalOfAllPaiedCaddies();
  }
  /*
  get all caddies names
  */
  public getCaddiesName(){
    this.caddiesName = this.caddyService.getCaddiesName();
  }

  /**
   * load current caddy
   */
  public loadCurentCaddy(caddyName: string){
    this.caddyService.currentCaddyName = caddyName;
    this.dataSource=[];
    this.getCurrentCaddy();
    this.getTotalOfAllNoPaiedCaddies();
    this.getTotalOfAllPaiedCaddies();
  }
  /**
   * create new caddy (another caddy)
   */
  public createNewCaddy(){
    let indice : number = this.caddyService.caddies.size + 1;
    this.caddyService.currentCaddyName = "Panier"+indice;
    this.caddyService.createNewCaddy();
    this.goToHomePage();
  }
  
  /**
   * get total price of all no paied caddies
   */
   public getTotalOfAllNoPaiedCaddies(){
    this.totalOfAllNoPaiedCaddies = this.caddyService.getTotalOfAllNoPaiedCaddies();
  }
  /**
   * get total price of all  paied caddies
   */
   public getTotalOfAllPaiedCaddies(){
    this.totalOfAllPaiedCaddies = this.caddyService.getTotalOfAllPaiedCaddies();
  }
  /**
   * add product to delete liste
   */
  public addProductToDeleteListe(row: any){
    if(!this.productToDeleteListeContains(row)){
      this.productToDelete.push(row);
    }
  }
  /**
   * productToDelet contains this product item to change row color
   */
  public productToDeleteListeContains(row: any): boolean{
    if(this.productToDelete.indexOf(row) > -1 ){
      return true;
    }
    return false;
  }
  /**
   * delete produc titem in caddy
   */
  public deleteThisProductNow(itemP: any){
    this.caddyService.deleteThisProductNow(itemP.id);
    this.productToDelete.forEach( (item, index) => {
      if(item === itemP) this.productToDelete.splice(index,1);
    });
    this.dataSource =[];
    this.getCurrentCaddy();
    this.getTotalOfAllNoPaiedCaddies();
    this.getTotalOfAllPaiedCaddies();

  }
  /**
   * verified if current caddy is paied
   */
  public isCurrentCaddyPaied(): boolean{
    if(this.caddyService.caddies.get(this.caddyService.currentCaddyName)){
     return this.caddyService.caddies.get(this.caddyService.currentCaddyName)!.paied;
    }
    return false;
  }
  /**
   * go to login page
   */
  public nouveauCommande(){
    if(this.dataSource){
      this.router.navigateByUrl("login/1");
    }else{
      alert("Vous n'avez rien dans le panier à commander! Veuillez choisir des produits dabord");
    }
  }
}
