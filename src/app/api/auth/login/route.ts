import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login API Error:', error);
      return NextResponse.json(
        { error: `Erreur de connexion: ${error.message}` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Connexion réussie.',
        user: data.user,
        session: data.session
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Login API Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}
