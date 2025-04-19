import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/database.types';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
  
  // Check if user is logged in
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ 
      status: 'unauthenticated',
      redirectTo: '/login' 
    });
  }
  
  try {
    // Check if user has a profile
    const { data, error } = await supabase
      .from('users')
      .select('id, onboard_success')
      .eq('id', session.user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user profile:', error);
      throw error;
    }
    
    // If user doesn't have a profile, create one
    if (!data) {
      console.log('Creating profile for user:', session.user.email);
      
      // Create a properly typed user object
      const newUser = { 
        id: session.user.id, 
        email: session.user.email || '', // Ensure email is not undefined
        onboard_success: false 
      };
      
      const { error: insertError } = await supabase
        .from('users')
        .insert(newUser);
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        throw insertError;
      }
      
      return NextResponse.json({ 
        status: 'created',
        redirectTo: '/onboarding'
      });
    }
    
    // If onboarding is not complete, redirect to onboarding
    if (!data.onboard_success) {
      return NextResponse.json({ 
        status: 'onboarding_required',
        redirectTo: '/onboarding'
      });
    }
    
    // User is fully set up
    return NextResponse.json({ 
      status: 'authenticated',
      redirectTo: '/dashboard'
    });
    
  } catch (err) {
    console.error('Error in check-profile:', err);
    return NextResponse.json({ 
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
      redirectTo: '/login'
    }, { status: 500 });
  }
}
