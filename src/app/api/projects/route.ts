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

// GET: Récupérer tous les projets
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Projects API Error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des projets.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ projects: data }, { status: 200 });
  } catch (err: unknown) {
    console.error('Projects API Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}

// POST: Créer un nouveau projet (admin uniquement)
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Réservé aux administrateurs.' },
        { status: 403 }
      );
    }

    const { title, description, imageUrl, status, location } = await request.json();
    const authorId = request.headers.get('x-user-id');

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Titre et description requis.' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('projects')
      .insert({
        title,
        description,
        image_url: imageUrl || null,
        status: status || 'en_cours',
        location: location || null,
        author_id: authorId,
        published: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Project Creation Error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création du projet.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Projet publié avec succès.', project: data },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('Project Creation Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer un projet (admin uniquement)
export async function DELETE(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Réservé aux administrateurs.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('id');

    if (!projectId) {
      return NextResponse.json(
        { error: 'ID du projet requis.' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Project Deletion Error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Projet supprimé avec succès.' },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('Project Deletion Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}
