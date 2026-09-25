import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // ── Controllo di sicurezza ─────────────────────────────────
  // Vercel inietta automaticamente l'header Authorization: Bearer <CRON_SECRET>
  // quando chiama un cron job configurato in vercel.json.
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    // In assenza della variabile d'ambiente, blocca la richiesta in produzione
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // ── Ping al database ───────────────────────────────────────
  try {
    const supabase = createClient();

    // Query minimale: un solo record, solo la colonna id
    const { error } = await supabase
      .from('students')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[keep-alive] Supabase query error:', error.message);
      return NextResponse.json(
        { status: 'error', message: error.message },
        { status: 500 }
      );
    }

    console.log('[keep-alive] Ping OK —', new Date().toISOString());

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[keep-alive] Unexpected error:', message);
    return NextResponse.json(
      { status: 'error', message },
      { status: 500 }
    );
  }
}
