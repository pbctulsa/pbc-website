import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { missionOutreach } from './event-data';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './events.scss',
  template: `
    <section class="page-section events-intro">
      <div class="section-inner">
        <p class="eyebrow">Life at Peniel Baptist Church</p>
        <h1 class="section-title">Events</h1>
        <p class="lead">Join us as we gather, serve our neighbors, and share the love of Jesus. Find the details you need to plan your visit.</p>
      </div>
    </section>
    <section class="page-section" aria-labelledby="upcoming-title">
      <div class="section-inner">
        <h2 id="upcoming-title">Upcoming events</h2>
        @if (upcoming) {
          <article class="event-card">
            <div class="date-block" aria-hidden="true"><span>NOV</span><strong>7</strong><span>SATURDAY</span></div>
            <div class="card-copy">
              <p class="eyebrow">Community outreach · Free lunch &amp; clothes</p>
              <h3>{{ event.title }}</h3>
              <p><time [attr.datetime]="event.start">{{ event.date }}</time> · {{ event.time }}</p>
              <p>Peniel Baptist Church · {{ event.address }}</p>
              <p>A one-day outreach for individuals and families in our community. All are welcome!</p>
              <a class="button-link" routerLink="/events/mission-outreach">View event details</a>
            </div>
          </article>
        } @else {
          <p>There are no upcoming events listed right now. Check back for our next gathering.</p>
          <a routerLink="/contact">Contact the church</a>
        }
        <div class="visit-note">
          <h2>Visit us on Sunday</h2>
          <p>You don’t have to wait for a special event to join us. Learn about our church and regular worship services.</p>
          <a class="button-link secondary" routerLink="/about">Plan a visit</a>
        </div>
      </div>
    </section>
  `
})
export class EventsComponent {
  protected readonly event = missionOutreach;
  protected readonly upcoming = Date.now() < Date.parse(missionOutreach.end);
}
