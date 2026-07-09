import { Env, fetchPublishedStaff } from '../../_lib/db';
import { json, jsonError } from '../../_lib/http';

export const onRequestGet = async ({ env }: { env: Env }) => {
  try {
    return json({ staff: await fetchPublishedStaff(env.DB) });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to load staff.');
  }
};
