import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-statistics-page',
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.css'],
})
export class StatisticsPageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription;

  constructor(private snackBar: MatSnackBar) {
    this.subscriptions = new Subscription();
  }

  showErrorToast(message: string) {
    this.snackBar.open(message, 'Dismiss', {
      duration: 3000,
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
