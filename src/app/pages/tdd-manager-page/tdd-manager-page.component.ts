import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tdd-manager-page',
  templateUrl: './tdd-manager-page.component.html',
  styleUrls: ['./tdd-manager-page.component.css'],
})
export class TddManagerPageComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  constructor() {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
