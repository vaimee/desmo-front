import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';

@Injectable({
  providedIn: 'root',
})
export class HasMetamaskGuard implements CanActivate {
  constructor(private desmold: DesmoldSDKService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    await this.desmold.isReady;

    if (this.desmold.isMetamaskInstalled) {
      return true;
    } else {
      return this.router.parseUrl('/notconnected');
    }
  }
}
