import { TddManagerPageComponent } from './pages/tdd-manager-page/tdd-manager-page.component';
import { DefaultComponent } from './layouts/default/default.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StatisticsPageComponent } from './pages/statistics-page/statistics-page.component';
import { QueryPageComponent } from './pages/query-page/query-page.component';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      { path: '', component: StatisticsPageComponent },
      { path: 'tdd', component: TddManagerPageComponent },
      { path: 'query', component: QueryPageComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
