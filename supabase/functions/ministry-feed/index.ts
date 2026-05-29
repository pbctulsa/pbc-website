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
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  username?: string;
};

const jsonHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const graphVersion = Deno.env.get('META_GRAPH_API_VERSION') || 'v20.0';
const config = readConfig();

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: jsonHeaders });
  }

  if (req.method !== 'GET') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  const url = new URL(req.url);
  const slug = url.searchParams.get('slug')?.trim();

  if (!slug) {
    return jsonResponse({ error: 'Missing slug parameter' }, 400);
  }

  const social = config[slug];

  if (!social) {
    return jsonResponse({ items: [] });
  }

  const items = [
    ...(social.facebook ? await fetchFacebookPosts(social.facebook) : []),
    ...(social.instagram ? await fetchInstagramMedia(social.instagram) : [])
  ]
    .filter(Boolean)
    .sort((left, right) => {
      const leftTime = left.createdTime ? Date.parse(left.createdTime) : 0;
      const rightTime = right.createdTime ? Date.parse(right.createdTime) : 0;
      return rightTime - leftTime;
    })
    .slice(0, 12);

  return jsonResponse({
    items,
    source: social.facebook && social.instagram ? 'facebook+instagram' : social.facebook ? 'facebook' : 'instagram'
  });
});

async function fetchFacebookPosts(config: {
  sourceId: string;
  accessToken: string;
  limit?: number;
}): Promise<Array<Record<string, unknown>>> {
  const endpoint = new URL(`https://graph.facebook.com/${graphVersion}/${config.sourceId}/posts`);
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

async function fetchInstagramMedia(config: {
  userId: string;
  accessToken: string;
  limit?: number;
}): Promise<Array<Record<string, unknown>>> {
  const endpoint = new URL(`https://graph.facebook.com/${graphVersion}/${config.userId}/media`);
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

  const error = (payload as { error?: { message?: string } }).error;
  return error?.message?.trim();
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: jsonHeaders
  });
}

function readConfig(): MinistrySocialConfig {
  const raw = Deno.env.get('MINISTRY_SOCIAL_CONFIG');

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as MinistrySocialConfig;
  } catch {
    return {};
  }
}
