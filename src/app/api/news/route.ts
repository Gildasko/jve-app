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

// GET: Récupérer toutes les actualités
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('news')
      .select(`
        *,
        profiles:author_id (full_name)
      `)
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('News API Error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des actualités.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ news: data }, { status: 200 });
  } catch (err: unknown) {
    console.error('News API Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}

// POST: Créer une nouvelle actualité (admin uniquement)
export async function POST(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Réservé aux administrateurs.' },
        { status: 403 }
      );
    }

    const { title, content, imageUrl } = await request.json();
    const authorId = request.headers.get('x-user-id');

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Titre et contenu requis.' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase
      .from('news')
      .insert({
        title,
        content,
        image_url: imageUrl || null,
        author_id: authorId,
        published: true,
      })
      .select()
      .single();

    if (error) {
      console.error('News Creation Error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'actualité.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Actualité publiée avec succès.', news: data },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error('News Creation Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer une actualité (admin uniquement)
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
    const newsId = searchParams.get('id');

    if (!newsId) {
      return NextResponse.json(
        { error: 'ID de l\'actualité requis.' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', newsId);

    if (error) {
      console.error('News Deletion Error:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Actualité supprimée avec succès.' },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error('News Deletion Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}
