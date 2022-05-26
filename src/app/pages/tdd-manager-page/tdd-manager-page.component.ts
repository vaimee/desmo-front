import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import {MatTableDataSource} from '@angular/material/table';
import {SelectionModel} from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';


export interface PeriodicElement {
  address: string;
  position: number;
  url: string;
  state: string;
  
}

const ELEMENT_DATA: PeriodicElement[] = [
  {position: 1, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', url: 'www.example_tdd_1.com', state: 'On'},
  {position: 2, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', url: 'www.example_tdd_1.com', state: 'Off'},
  {position: 3, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', url: 'www.example_tdd_1.com', state: 'On'},
  {position: 4, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', url: 'www.example_tdd_1.com', state: 'Off'},
  {position: 5, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', url: 'www.example_tdd_1.com', state: 'On'},
  {position: 6, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', url: 'www.example_tdd_1.com', state: 'Off'},
  {position: 7, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', url: 'www.example_tdd_1.com', state: 'Off'},
  {position: 8, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', url: 'www.example_tdd_1.com', state: 'Off'},
  {position: 9, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', url: 'www.example_tdd_1.com', state: 'On'},
  {position: 10, address: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', url: 'www.example_tdd_1.com', state: 'On'},
];

@Component({
  selector: 'app-tdd-manager-page',
  templateUrl: './tdd-manager-page.component.html',
  styleUrls: ['./tdd-manager-page.component.css']
})

export class TddManagerPageComponent {
  constructor(private _snackBar: MatSnackBar) {}
  value = '';
  displayedColumns: string[] = ['select', 'position', 'address', 'url', 'state'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  selection = new SelectionModel<PeriodicElement>(true, []);
  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }
    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
      const numSelected = this.selection.selected.length;
      const numRows = this.dataSource.data.length;
      return numSelected === numRows;
    }
  
    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
      if (this.isAllSelected()) {
        this.selection.clear();
        return;
      }
  
      this.selection.select(...this.dataSource.data);
    }
  
    /** The label for the checkbox on the passed row */
    checkboxLabel(row?: PeriodicElement): string {
      if (!row) {
        return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
      }
      return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
    }
}
