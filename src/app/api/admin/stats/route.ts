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

export async function GET(request: Request) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Accès non autorisé. Réservé aux administrateurs.' },
        { status: 403 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Récupérer tous les profils
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('Stats API Error (profiles):', profilesError);
    }

    // Récupérer les actualités
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('id');

    if (newsError) {
      console.error('Stats API Error (news):', newsError);
    }

    // Récupérer les projets
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, status');

    if (projectsError) {
      console.error('Stats API Error (projects):', projectsError);
    }

    // Calculer les statistiques des membres
    const allProfiles = profiles || [];
    const memberStats = {
      total: allProfiles.length,
      pending: allProfiles.filter(p => p.status === 'pending').length,
      validated: allProfiles.filter(p => p.status === 'member').length,
      rejected: allProfiles.filter(p => p.status === 'rejected').length,
      byCountry: [] as { country: string; count: number }[],
    };

    // Répartition par pays
    const countryMap = new Map<string, number>();
    allProfiles.forEach(p => {
      const country = p.country || 'Non renseigné';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });
    memberStats.byCountry = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 pays

    // Statistiques des projets
    const allProjects = projects || [];
    const projectStats = {
      total: allProjects.length,
      enCours: allProjects.filter(p => p.status === 'en_cours').length,
      termine: allProjects.filter(p => p.status === 'termine').length,
      planifie: allProjects.filter(p => p.status === 'planifie').length,
    };

    // Dernières inscriptions (5 derniers)
    const recentMembers = allProfiles.slice(0, 5).map(p => ({
      id: p.id,
      full_name: p.full_name,
      country: p.country,
      created_at: p.created_at,
    }));

    const stats = {
      members: memberStats,
      news: {
        total: news?.length || 0,
      },
      projects: projectStats,
      recentMembers,
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (err: unknown) {
    console.error('Stats API Exception:', err);
    return NextResponse.json(
      { error: 'Une erreur inattendue s\'est produite.' },
      { status: 500 }
    );
  }
}
