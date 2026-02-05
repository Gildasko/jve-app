import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// Vérifier si l'utilisateur est admin
async function verifyAdmin(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  return profile?.role === 'admin';
}

// GET - Récupérer tous les messages (admin uniquement)
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { data: messages, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Envoyer un message de contact (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Nom, email et message sont requis' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        subject: subject || 'Sans objet',
        message,
        status: 'unread',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Message envoyé avec succès',
      data 
    });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH - Marquer un message comme lu/traité (admin uniquement)
export async function PATCH(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const body = await request.json();
    const { messageId, status } = body;

    if (!messageId || !status) {
      return NextResponse.json({ error: 'ID et statut requis' }, { status: 400 });
    }

    const { error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', messageId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un message (admin uniquement)
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const isAdmin = await verifyAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', messageId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
