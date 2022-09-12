import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TddManagerPageComponent } from './pages/tdd-manager-page/tdd-manager-page.component';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { DefaultComponent } from './layouts/default/default.component';
import { StatisticsPageComponent } from './pages/statistics-page/statistics-page.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { QueryPageComponent } from './pages/query-page/query-page.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { TddManagerComponent } from './components/tdd-manager/tdd-manager.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRadioModule } from '@angular/material/radio';
import { TransactionViewerComponent } from './components/transaction-viewer/transaction-viewer.component';
import { MatStepperModule } from '@angular/material/stepper';
import { NgxMapboxGLModule } from 'ngx-mapbox-gl';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { TddListTableComponent } from './components/tdd-list-table/tdd-list-table.component';
import { TransactionListTableComponent } from './components/transaction-list-table/transaction-list-table.component';

const mapboxToken =
  'pk.eyJ1IjoiaW9zb25vcGVyc2lhIiwiYSI6ImNsNjBzYjVldjAwNWszaW1rNWZtdTRuNjkifQ.2lGOSvqt5lahEfZYLa3eRg';

@NgModule({
  declarations: [
    AppComponent,
    TddManagerPageComponent,
    DefaultComponent,
    StatisticsPageComponent,
    QueryPageComponent,
    ConfirmationDialogComponent,
    TddManagerComponent,
    TransactionViewerComponent,
    TddListTableComponent,
    TransactionListTableComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    LayoutModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatGridListModule,
    MatInputModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatRadioModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatTreeModule,
    NgxMapboxGLModule.withConfig({
      accessToken: mapboxToken, // Optional, can also be set per map (accessToken input of mgl-map)
      // geocoderAccessToken: mapboxToken // Optional, specify if different from the map access token, can also be set per mgl-geocoder (accessToken input of mgl-geocoder)
    }),
  ],
  providers: [DesmoldSDKService],
  bootstrap: [AppComponent],
})
export class AppModule {}
