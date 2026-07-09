import { Env, fetchPublishedStaff } from '../../_lib/db';
import { json, jsonError } from '../../_lib/http';

export const onRequestGet = async ({ env, params }: { env: Env; params: { id: string } }) => {
  try {
    const staff = await fetchPublishedStaff(env.DB, params.id);

    if (!staff[0]) {
      return jsonError('Staff member not found.', 404);
    }

    return json({ staff: staff[0] });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to load staff member.');
  }
};
