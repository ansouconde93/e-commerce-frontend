import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Caddy } from '../model/Caddy';
import { Product } from '../model/Product';
import { ProductItem } from '../model/ProductItem';

@Injectable({
  providedIn: 'root'
})
export class CaddyService {

  public currentCaddyName: string="Panier1";
  public defaultCaddyName: string="Panier1";
  public caddies: Map<string, Caddy>= new Map();

  public monObservable!: Observable<number>;

  constructor() {
    this.loadCaddiesOrCreate();
  }

  /**
   * load caddies if exist or create ii not
   */
  public loadCaddiesOrCreate(){
    
    let myCaddies = localStorage.getItem("myCaddies");
    if(myCaddies){
      let caddies = JSON.parse(myCaddies); 

     for(let j=0; j < caddies.length; j++){
        let caddy :Caddy = new Caddy();
        let caddyName = caddies[j].name;
        let cady = caddies[j].caddy;
        let items = cady.items;
        caddy.name = caddyName;
        caddy.client = cady.client;
        caddy.paied = cady.paied;
        for(let i=0; i < items.length; i++){
          let prodItem: ProductItem = new ProductItem();
          prodItem.price = items[i].productItem.price;
          prodItem.quantite = items[i].productItem.quantite;
          prodItem.remise = items[i].productItem.remise;
          prodItem.product = items[i].productItem.product;
          
          caddy.items.set(items[i].idProduct, prodItem);
        } 
        this.caddies.set(caddyName, caddy);
      }
      if(!this.caddies.get(this.currentCaddyName) && !this.caddies.get(this.defaultCaddyName)){
        this.currentCaddyName = this.defaultCaddyName;
        this.createNewCaddy();
      }
    }else{
      this.createNewCaddy();
    }
  }  
  /**
   * Create new caddy when customer decide to create another caddy
   */
  public createNewCaddy(){
    let caddy: Caddy = new Caddy();
    caddy.name = this.currentCaddyName;
    this.caddies.set(this.currentCaddyName,caddy);
  }

  /*
    Save caddies in local storage
  */
  public saveCaddiesLocalStorage(){
    let caddies: any[] = [];
    let items :any[] = [];
    for( let caddyKey of this.caddies.keys()) { 
      for(let [key, val] of this.caddies.get(caddyKey)!.items){
        items.push({"idProduct": key, "productItem": val});
      }
      let myCaddy = {"name": caddyKey,"items": items,"client": this.caddies.get(caddyKey)?.client,"paied":this.caddies.get(caddyKey)?.paied};
      caddies.push({"name": caddyKey,"caddy":myCaddy});
      items=[];
    }
    localStorage.setItem("myCaddies", JSON.stringify(caddies));    
  }
  /*
    add product to caddy
  */
  public addProductToCaddy(product: Product){
    if(this.caddies!.size !=0){
      let caddy = this.caddies.get(this.currentCaddyName);
      if(caddy){
        let productItem = caddy.items.get(product.idproduct);
        if(productItem){
          productItem.quantite = productItem.quantite + product.quantite;
        }else{
          let pItem = new ProductItem();
          pItem.product = product;
          pItem.quantite = product.quantite;
          pItem.price = product.price;
          pItem.remise = 0;
          caddy.items.set(product.idproduct, pItem);
        }
        this.caddies.set(this.currentCaddyName,caddy);
        this.saveCaddiesLocalStorage();              
      }
    }else{//if customer delete all caddies and try to add product.
      this.createNewCaddy();
      let pItem = new ProductItem();
      pItem.product = product;
      pItem.quantite = product.quantite;
      pItem.price = product.price;
      pItem.remise =0;
      this.caddies.get(this.currentCaddyName)!.items.set(product.idproduct, pItem);
    }    
    this.saveCaddiesLocalStorage();              
  }
/*
    function to calculate total of price
 */
  public getTotalPrice(): number{
    let total = 0;
    let caddy = this.caddies.get(this.currentCaddyName);
    if(caddy){
      for(let value of caddy!.items.values()){
        total = total + value.quantite * value.price;
      }
    }
    return total-this.getTotalRemise();
  }
  /*
    function to calculate total of remise
 */
  public getTotalRemise(): number{
    let total = 0;
    let caddy = this.caddies.get(this.currentCaddyName);
    if(caddy){
      for(let value of caddy!.items.values()){
        total = total + value.remise;
      }
    }
    return total;
  }
  /**
   * get total price of all no paied caddies
   */
  public getTotalOfAllNoPaiedCaddies(): number{
    let totalOfAllNoPaiedCaddies = 0;
    for( let caddyKey of this.caddies.keys()) {
      let caddyTotalPrice =0;
      let caddyTotalRemise =0;
      let caddy = this.caddies.get(caddyKey);
      if(caddy!.paied== false){
        for(let value of caddy!.items.values()){          
          caddyTotalRemise = caddyTotalRemise + value.remise;
          caddyTotalPrice = caddyTotalPrice +value.quantite * value.price;
        }
      }
      caddyTotalPrice = caddyTotalPrice - caddyTotalRemise; 
      totalOfAllNoPaiedCaddies = totalOfAllNoPaiedCaddies + caddyTotalPrice;
    }
    return totalOfAllNoPaiedCaddies;
  }
  /**
   * get total price of all paied caddies
   */
  public getTotalOfAllPaiedCaddies(): number{
    let totalOfAllPaiedCaddies = 0;
    for( let caddyKey of this.caddies.keys()) {
      let caddyTotalPrice =0;
      let caddyTotalRemise =0;
      let caddy = this.caddies.get(caddyKey);
      if(caddy!.paied== true){
        for(let value of caddy!.items.values()){          
          caddyTotalRemise = caddyTotalRemise + value.remise;
          caddyTotalPrice = caddyTotalPrice +value.quantite *value.price;
        }
      }
      caddyTotalPrice = caddyTotalPrice - caddyTotalRemise; 
      totalOfAllPaiedCaddies = totalOfAllPaiedCaddies + caddyTotalPrice;
    }
    return totalOfAllPaiedCaddies;
  }
  /*
    delete current caddy in local storage
  */
 public deleteCurrentCaddyLocalStorage(){
   this.caddies.delete(this.currentCaddyName);
   if(!this.caddies){
    this.currentCaddyName=this.defaultCaddyName;
   }else{
    this.saveCaddiesLocalStorage();
   }
  }
  /**
   * Delete productitem in current caddy
   */
  public deleteThisProductNow(id: any){
    this.caddies.get(this.currentCaddyName)!.items.delete(id);
    this.saveCaddiesLocalStorage();
  }
/*
  get all caddies names
*/
  public getCaddiesName(): string[]{
    let caddiesName : string[]=[];
    if(this.caddies){
      if(!this.caddies.get(this.currentCaddyName) && !this.caddies.get(this.defaultCaddyName)){
        this.currentCaddyName = this.defaultCaddyName;
        caddiesName.push(this.defaultCaddyName);
      }else{
        for( let caddyName of this.caddies.keys()){
          caddiesName.push(caddyName);
        }
      }
    }else{
      caddiesName.push(this.currentCaddyName);
    }
    return caddiesName;
  }
}
