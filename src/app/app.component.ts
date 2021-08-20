import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './service/authentication.service';
import { CaddyService } from './service/caddy.service';
import { ScreenControllerService } from './service/screen-controller.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy{

  constructor(public screenControllerService: ScreenControllerService,
    public caddyService: CaddyService,
    private router: Router) { }

  ngOnInit(): void {
    this.screenControllerService.getScreenSize();
  }
  ngOnDestroy(): void {
    this.screenControllerService.mediaSub.unsubscribe;
  }
  public goToCaddyPage(){
    this.router.navigateByUrl('caddy');
  }
}
