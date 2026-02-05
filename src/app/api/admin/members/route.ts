import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Fonction pour vérifier si l'utilisateur est admin
async function verifyAdmin(request: Request) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Récupérer l'userId depuis les headers
  const userId = request.headers.get('x-user-id');
  
  if (!userId) {
    return false;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.role === 'admin';
}

// GET: Récupérer tous les profils
export async function GET(request: Request) {
  try {
    // Vérifier si l'utilisateur est admin
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Réservé aux administrateurs.' },
        { status: 403 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('status', { ascending: true });

    if (error) {
      console.error('Admin Members API Error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des membres.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { members: data },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('Admin Members API Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}

// PATCH: Mettre à jour le statut d'un membre
export async function PATCH(request: Request) {
  try {
    // Vérifier si l'utilisateur est admin
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Réservé aux administrateurs.' },
        { status: 403 }
      );
    }

    const { userId, status } = await request.json();

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'ID utilisateur et statut requis.' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);

    if (error) {
      console.error('Admin Update Status Error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du statut.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Statut mis à jour avec succès.' },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('Admin Update Status Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}
