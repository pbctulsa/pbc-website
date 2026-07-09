import { Env } from '../_lib/db';
import { json, jsonError, readJson } from '../_lib/http';

type SongEditSuggestion = {
  songId?: string;
  songTitle?: string;
  songNumber?: number | null;
  originalFields?: Record<string, unknown>;
  suggestedFields?: Record<string, unknown>;
  submitterName?: string;
  submitterEmail?: string;
  note?: string;
};

export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  try {
    const suggestion = await readJson<SongEditSuggestion>(request);

    if (!suggestion.songId || !suggestion.songTitle || !suggestion.originalFields || !suggestion.suggestedFields) {
      return jsonError('Missing required song suggestion fields.', 400);
    }

    await env.DB.prepare(
      `insert into song_edit_suggestions (
        song_id,
        song_title,
        song_number,
        original_fields,
        suggested_fields,
        submitter_name,
        submitter_email,
        note,
        status
      ) values (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
    )
      .bind(
        suggestion.songId,
        suggestion.songTitle,
        suggestion.songNumber ?? null,
        JSON.stringify(suggestion.originalFields),
        JSON.stringify(suggestion.suggestedFields),
        blankToNull(suggestion.submitterName),
        blankToNull(suggestion.submitterEmail),
        blankToNull(suggestion.note)
      )
      .run();

    return json({ ok: true }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : 'Unable to submit song edit suggestion.');
  }
};

function blankToNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}
