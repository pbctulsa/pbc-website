import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { churchInfo } from '@core/church-info';

@Component({
  selector: 'app-jubilee',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './jubilee.component.html',
  styleUrl: './jubilee.component.scss'
})
export class JubileeComponent {
  protected readonly church = churchInfo;
}
