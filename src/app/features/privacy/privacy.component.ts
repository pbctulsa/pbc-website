import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { churchInfo } from '@core/church-info';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.scss'
})
export class PrivacyComponent {
  protected readonly church = churchInfo;
}
