import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-songbook-app',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './songbook-app.component.html',
  styleUrl: './songbook-app.component.scss'
})
export class SongbookAppComponent {}
