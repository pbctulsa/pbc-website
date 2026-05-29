# ministry-feed

Returns normalized social posts for the ministry pages.

## Secrets

Set one Supabase secret named `MINISTRY_SOCIAL_CONFIG` with JSON like:

```json
{
  "men": {
    "facebook": {
      "sourceId": "penielMen",
      "accessToken": "FACEBOOK_PAGE_ACCESS_TOKEN"
    }
  },
  "women": {
    "facebook": {
      "sourceId": "penielWomen",
      "accessToken": "FACEBOOK_PAGE_ACCESS_TOKEN"
    }
  },
  "children": {
    "facebook": {
      "sourceId": "penielChildren",
      "accessToken": "FACEBOOK_PAGE_ACCESS_TOKEN"
    }
  },
  "khanglai": {
    "facebook": {
      "sourceId": "penielYouthTulsa",
      "accessToken": "FACEBOOK_PAGE_ACCESS_TOKEN"
    },
    "instagram": {
      "userId": "INSTAGRAM_USER_ID",
      "accessToken": "INSTAGRAM_GRAPH_ACCESS_TOKEN"
    }
  }
}
```

Optional secret:

```text
META_GRAPH_API_VERSION=v20.0
```

## Endpoint

The frontend calls:

```text
https://<your-project>.supabase.co/functions/v1/ministry-feed?slug=women
```

## Notes

- The function is public and sends CORS headers so the GitHub Pages site can call it directly.
- If a ministry is not configured yet, it returns an empty item list.
- Facebook and Instagram data are normalized into the same card layout in Angular.
