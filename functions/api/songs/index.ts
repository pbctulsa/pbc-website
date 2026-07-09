import { Env, SongRow } from '../../_lib/db';
import { json, jsonError } from '../../_lib/http';

export const onRequestGet = async ({ env }: { env: Env }) => {
  try {
    const countResult = await env.DB.prepare('select count(*) as total from songs where is_published = 1').first<{
      total: number;
    }>();
    const rows =
      (
        await env.DB.prepare(
          `select * from songs
           where is_published = 1
           order by coalesce(song_number, number), title`
        ).all<SongRow>()
      ).results ?? [];

    return json({
      songs: rows,
      total: countResult?.total ?? rows.length
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to load songs.');
  }
};
