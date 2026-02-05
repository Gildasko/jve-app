
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: Request) {
  try {
    const { email, password, fullName, country, city } = await request.json();

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          country,
          city,
        },
      },
    });

    if (authError) {
      console.error('Signup API Error:', authError);
      return NextResponse.json(
        { error: `Erreur lors de l'inscription: ${authError.message}` },
        { status: 400 }
      );
    }

    // Créer le profil dans la table profiles
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          country: country,
          city: city,
          status: 'pending',
        });

      if (profileError) {
        console.error('Profile Creation Error:', profileError);
        // On ne bloque pas l'inscription si le profil échoue, mais on log l'erreur
      }
    }

    return NextResponse.json(
      { message: 'Inscription réussie. Veuillez vérifier vos e-mails.' },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Signup API Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}
