import { Injectable } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScreenControllerService {
  public mediaSub!: Subscription;
  public ecranXS: boolean = false;
  public ecranSM: boolean = false;
  public ecranMD: boolean = false;

  constructor(private mediaObserverService: MediaObserver) { }
  
  public getScreenSize(){
    this.mediaSub = this.mediaObserverService.media$.subscribe((response: MediaChange) =>{
      this.ecranXS = response.mqAlias === "xs" ? true : false;
      this.ecranSM = response.mqAlias === "sm" ? true : false;
      this.ecranMD = response.mqAlias === "md" ? true : false;
    });
  }
}
