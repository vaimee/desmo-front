import { Component, Inject, OnInit } from '@angular/core';
import {
  MatSnackBarRef,
  MAT_SNACK_BAR_DATA,
} from '@angular/material/snack-bar';
import { MatSnackBar } from '@angular/material/snack-bar/snack-bar';

@Component({
  selector: 'app-snackbar-with-link',
  templateUrl: './snackbar-with-link.component.html',
  styleUrls: ['./snackbar-with-link.component.css'],
})
export class SnackbarWithLinkComponent implements OnInit {
  link: string;
  linktext: string;
  message: string;
  action: string;

  constructor(
    public snackBarRef: MatSnackBarRef<SnackbarWithLinkComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: any
  ) {
    this.link = data?.link;
    this.linktext = data?.linktext;
    this.message = data?.message;
    this.action = data?.action;
  }

  ngOnInit(): void {}

}
