import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { MinistryFeedItem } from '@models/ministry-feed-item.model';

interface MinistryFeedResponse {
  items?: MinistryFeedItem[];
}

@Injectable({
  providedIn: 'root'
})
export class MinistryFeedService {
  async getFeed(slug: string): Promise<MinistryFeedItem[]> {
    const endpoint = new URL('/functions/v1/ministry-feed', environment.supabase.url);
    endpoint.searchParams.set('slug', slug);

    const response = await fetch(endpoint.toString(), {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(body || 'Unable to load ministry feed.');
    }

    const data = (await response.json()) as MinistryFeedResponse;
    return data.items ?? [];
  }
}
