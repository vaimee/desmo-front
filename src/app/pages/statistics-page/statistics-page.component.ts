import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { DesmoldSDKService } from 'src/app/services/desmold-sdk/desmold-sdk.service';

interface TDD {
  address: string;
  url: string;
  state: boolean;
  score: number;
}

@Component({
  selector: 'app-statistics-page',
  templateUrl: './statistics-page.component.html',
  styleUrls: ['./statistics-page.component.css']
})
export class StatisticsPageComponent {
  private readonly CACHE_KEY: string = 'completeTddList';

  displayedColumns: string[] = ['address', 'url', 'state', 'score'];
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

  async ngOnInit(): Promise<void> {
    // this.tableData = this.desmold.desmoHub.getCompleteListOfTDDs();
    const list = await this.desmold.desmoHub.getTDDList()

    this.tableData = list.map(({owner, disabled, score, url}) => ({address: owner, url, state: !disabled, score: score.toNumber()}));
    // Save new data inside the cache:
    localStorage.setItem(this.CACHE_KEY, JSON.stringify(this.tableData));

    this.dataSource = new MatTableDataSource<TDD>(this.tableData);
    this.loading = false;
  }

}
