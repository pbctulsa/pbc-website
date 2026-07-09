import { Env, SongRow } from '../../_lib/db';
import { json, jsonError } from '../../_lib/http';

export const onRequestGet = async ({ env, params }: { env: Env; params: { id: string } }) => {
  try {
    const row = await env.DB.prepare('select * from songs where id = ? and is_published = 1').bind(params.id).first<SongRow>();

    if (!row) {
      return jsonError('Song not found.', 404);
    }

    return json({ song: row });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to load song.');
  }
};
