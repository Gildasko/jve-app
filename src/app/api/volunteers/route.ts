import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Fonction pour vérifier si l'utilisateur est admin
async function verifyAdmin(request: Request) {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const userId = request.headers.get('x-user-id');
  
  if (!userId) return false;

  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return false;
  return data.role === 'admin';
}

// GET: Récupérer toutes les demandes de bénévolat (admin uniquement)
export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé.' },
        { status: 403 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Volunteers API Error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des demandes.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ volunteers: data }, { status: 200 });
  } catch (err: unknown) {
    console.error('Volunteers API Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}

// POST: Soumettre une demande de bénévolat (public)
export async function POST(request: Request) {
  try {
    const { fullName, email, phone, country, city, motivation, availability, skills } = await request.json();

    if (!fullName || !email || !motivation) {
      return NextResponse.json(
        { error: 'Nom, email et motivation sont requis.' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('volunteers')
      .insert({
        full_name: fullName,
        email,
        phone: phone || null,
        country: country || null,
        city: city || null,
        motivation,
        availability: availability || null,
        skills: skills || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Volunteer Submission Error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la soumission de votre candidature.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Votre candidature a été envoyée avec succès !', volunteer: data },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('Volunteer Submission Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}

// PATCH: Mettre à jour le statut d'une demande (admin uniquement)
export async function PATCH(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé.' },
        { status: 403 }
      );
    }

    const { volunteerId, status } = await request.json();

    if (!volunteerId || !status) {
      return NextResponse.json(
        { error: 'ID et statut requis.' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from('volunteers')
      .update({ status })
      .eq('id', volunteerId);

    if (error) {
      console.error('Volunteer Update Error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Statut mis à jour avec succès.' },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('Volunteer Update Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}
