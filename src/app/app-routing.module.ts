import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApprobationComponent } from './components/approbation/approbation.component';
import { CaddyComponent } from './components/caddy/caddy.component';
import { CategoryComponent } from './components/category/category.component';
import { ContactComponent } from './components/contact/contact.component';
import { LoginComponent } from './components/login/login.component';
import { PageNotFoundComponentComponent } from './components/page-not-found-component/page-not-found-component.component';
import { ProductDetailsComponent } from './components/product-details/product-details.component';
import { ProductComponent } from './components/product/product.component';

const routes: Routes = [
  { path:'login/:id',component:LoginComponent },
  { path:'products',component:ProductComponent },
  { path:'contactus',component:ContactComponent },
  { path:'approbation',component:ApprobationComponent },
  { path: 'produt-details/:id', component:ProductDetailsComponent},
  { path: 'category/:id', component:CategoryComponent},
  { path:'caddy',component:CaddyComponent },
  { path: '',   redirectTo: 'products', pathMatch: 'full' }, 
  { path: '**', component: PageNotFoundComponentComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
