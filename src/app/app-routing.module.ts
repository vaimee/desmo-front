import { TddManagerPageComponent } from './pages/tdd-manager-page/tdd-manager-page.component';
import { DefaultComponent } from './layouts/default/default.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatisticsPageComponent } from './pages/statistics-page/statistics-page.component';
import { QueryPageComponent } from './pages/query-page/query-page.component';
import { NotConnectedPageComponent } from './pages/not-connected-page/not-connected-page/not-connected-page.component';
import { HasMetamaskGuard } from './guards/has-metamask/has-metamask.guard';
import { IsLoggedInGuard } from './guards/is-logged-in/is-logged-in.guard';
import { IsVivianiChainGuard } from './guards/is-viviani-chain/is-viviani-chain.guard';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      {
        path: '',
        component: StatisticsPageComponent,
        canActivate: [HasMetamaskGuard, IsVivianiChainGuard],
      },
      {
        path: 'tdd',
        component: TddManagerPageComponent,
        canActivate: [HasMetamaskGuard, IsVivianiChainGuard, IsLoggedInGuard],
      },
      {
        path: 'query',
        component: QueryPageComponent,
        canActivate: [HasMetamaskGuard, IsVivianiChainGuard, IsLoggedInGuard],
      },
      {
        path: 'notconnected',
        component: NotConnectedPageComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
