import { Env } from '../_lib/db';
import { json, jsonError } from '../_lib/http';

type MinistrySocialConfig = Record<
  string,
  {
    facebook?: {
      sourceId: string;
      accessToken: string;
      limit?: number;
    };
    instagram?: {
      userId: string;
      accessToken: string;
      limit?: number;
    };
  }
>;

type FacebookPost = {
  id?: string;
  message?: string;
  story?: string;
  permalink_url?: string;
  created_time?: string;
  full_picture?: string;
  from?: { name?: string };
  attachments?: {
    data?: Array<{
      media?: { image?: { src?: string } };
      subattachments?: { data?: Array<{ media?: { image?: { src?: string } } }> };
      media_type?: string;
      url?: string;
    }>;
  };
};

type InstagramMedia = {
  id?: string;
  caption?: string;
  permalink?: string;
  timestamp?: string;
  media_url?: string;
  thumbnail_url?: string;
  username?: string;
};

export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug')?.trim();

    if (!slug) {
      return jsonError('Missing slug parameter.', 400);
    }

    const social = readConfig(env)[slug];

    if (!social) {
      return json({ items: [] });
    }

    const items = [
      ...(social.facebook ? await fetchFacebookPosts(env, social.facebook) : []),
      ...(social.instagram ? await fetchInstagramMedia(env, social.instagram) : [])
    ]
      .sort((left, right) => {
        const leftTime = typeof left.createdTime === 'string' ? Date.parse(left.createdTime) : 0;
        const rightTime = typeof right.createdTime === 'string' ? Date.parse(right.createdTime) : 0;
        return rightTime - leftTime;
      })
      .slice(0, 12);

    return json({
      items,
      source: social.facebook && social.instagram ? 'facebook+instagram' : social.facebook ? 'facebook' : 'instagram'
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to load ministry feed.');
  }
};

async function fetchFacebookPosts(
  env: Env,
  config: { sourceId: string; accessToken: string; limit?: number }
): Promise<Array<Record<string, unknown>>> {
  const endpoint = new URL(`https://graph.facebook.com/${env.META_GRAPH_API_VERSION || 'v20.0'}/${config.sourceId}/posts`);
  endpoint.searchParams.set(
    'fields',
    'message,story,permalink_url,created_time,full_picture,from,attachments{media,subattachments,media_type,url}'
  );
  endpoint.searchParams.set('limit', String(config.limit ?? 6));
  endpoint.searchParams.set('access_token', config.accessToken);

  const response = await fetch(endpoint);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(extractGraphError(payload) || 'Unable to load Facebook posts.');
  }

  return ((payload as { data?: FacebookPost[] }).data ?? []).map((post) => ({
    id: post.id || crypto.randomUUID(),
    platform: 'facebook' as const,
    author: post.from?.name,
    message: firstText(post.message, post.story),
    imageUrl: firstImageUrl(post),
    permalinkUrl: post.permalink_url || `https://www.facebook.com/${config.sourceId}`,
    createdTime: post.created_time
  }));
}

async function fetchInstagramMedia(
  env: Env,
  config: { userId: string; accessToken: string; limit?: number }
): Promise<Array<Record<string, unknown>>> {
  const endpoint = new URL(`https://graph.facebook.com/${env.META_GRAPH_API_VERSION || 'v20.0'}/${config.userId}/media`);
  endpoint.searchParams.set('fields', 'id,caption,permalink,timestamp,media_type,media_url,thumbnail_url,username');
  endpoint.searchParams.set('limit', String(config.limit ?? 6));
  endpoint.searchParams.set('access_token', config.accessToken);

  const response = await fetch(endpoint);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(extractGraphError(payload) || 'Unable to load Instagram media.');
  }

  return ((payload as { data?: InstagramMedia[] }).data ?? []).map((media) => ({
    id: media.id || crypto.randomUUID(),
    platform: 'instagram' as const,
    author: media.username,
    message: media.caption,
    imageUrl: media.media_url,
    thumbnailUrl: media.thumbnail_url,
    permalinkUrl: media.permalink || `https://www.instagram.com/${media.username || ''}`.replace(/\/$/, ''),
    createdTime: media.timestamp
  }));
}

function readConfig(env: Env): MinistrySocialConfig {
  if (!env.MINISTRY_SOCIAL_CONFIG) {
    return {};
  }

  try {
    return JSON.parse(env.MINISTRY_SOCIAL_CONFIG) as MinistrySocialConfig;
  } catch {
    return {};
  }
}

function firstText(...values: Array<string | undefined>): string | undefined {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim();
}

function firstImageUrl(post: FacebookPost): string | undefined {
  if (post.full_picture) {
    return post.full_picture;
  }

  const attachments = post.attachments?.data ?? [];

  for (const attachment of attachments) {
    const image = attachment.media?.image?.src;
    if (image) {
      return image;
    }

    const nested = attachment.subattachments?.data ?? [];
    for (const subattachment of nested) {
      const nestedImage = subattachment.media?.image?.src;
      if (nestedImage) {
        return nestedImage;
      }
    }
  }

  return undefined;
}

function extractGraphError(payload: unknown): string | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  return (payload as { error?: { message?: string } }).error?.message?.trim();
}
