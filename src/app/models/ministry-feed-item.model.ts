export type MinistryFeedPlatform = 'facebook' | 'instagram';

export interface MinistryFeedItem {
  id: string;
  platform: MinistryFeedPlatform;
  author?: string;
  message?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  permalinkUrl: string;
  createdTime?: string;
}
