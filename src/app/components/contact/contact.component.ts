import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Contact } from 'src/app/model/Contact';
import { ECommService } from 'src/app/service/eComm.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  constructor(private router: Router,
    private eComm: ECommService) { }

  ngOnInit(): void {
  }

  public goToHomePage(){
    this.router.navigateByUrl("products");
  }
  public envoyerMessageContact(contact: any){
    let contat: Contact = new Contact();
    contat.message = contact.message;
    contat.objet = contact.objet;
    contat.username = contact.username;
    this.eComm.postRessource("/contactus",contat)!
      .subscribe(response =>{
        alert("Nous avons bien réçu votre message et nous vous contacterons très prochainement. merci!");
        this.router.navigateByUrl("products");
      }, err=>{
        alert("Nous vous informons que nous n'avons réçu votre email, veuillez nous contacter très prochainement!");
        this.router.navigateByUrl("products");
      }
    );
  }
}
