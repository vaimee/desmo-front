import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';

interface TDD {
  address: string;
  url: string;
  state: boolean;
}

@Component({
  selector: 'app-statistics-page',
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.css']
})
export class StatisticsPageComponent {
  private readonly CACHE_KEY: string = 'completeTddList';

  displayedColumns: string[] = ['address', 'url', 'state'];
  tableData: TDD[];
  dataSource: MatTableDataSource<TDD>;

  loading: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(private desmold: DesmoldSDKService) {
    // Check the cache for pre-existing data or initialise with an empty list:
    const tddList: string = localStorage.getItem(this.CACHE_KEY) ?? '[]';
    this.tableData = JSON.parse(tddList) as TDD[];
    this.dataSource = new MatTableDataSource<TDD>(this.tableData);
  }

  ngOnInit(): void {
    // TODO: implement a mechanism in the SDK to retrieve the complete list of TDDs
    // this.tableData = this.desmold.desmoHub.getCompleteListOfTDDs();

    // Save new data inside the cache:
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));

    this.dataSource = new MatTableDataSource<TDD>(this.tableData);
    this.loading = false;
  }

}
