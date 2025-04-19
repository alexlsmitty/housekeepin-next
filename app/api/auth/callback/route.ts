import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/lib/supabase/database.types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  console.log('OAuth callback received with code:', code ? 'present' : 'missing');

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient<Database>({ 
      cookies: () => cookieStore
    });
    
    try {
      // Exchange the code for a session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      console.log('Session exchange result:', 
        data?.session ? `Session created for ${data.session.user.email}` : 'No session', 
        error ? `Error: ${error.message}` : 'No error'
      );
      
      if (error) throw error;
      
      if (data?.session) {
        // Check if user already exists in our users table
        const { data: existingUser, error: userError } = await supabase
          .from('users')
          .select('id, household_id, onboard_success, name, email')
          .eq('id', data.session.user.id)
          .single();
        
        if (userError && userError.code !== 'PGRST116') {  // PGRST116 is "not found"
          console.error('Error checking user:', userError);
        }
        
        // If user doesn't exist, create a new user record
        if (!existingUser) {
          // Extract user metadata
          const userEmail = data.session.user.email;
          const userName = data.session.user.user_metadata.full_name || 
                         data.session.user.user_metadata.name || 
                         userEmail?.split('@')[0] || 
                         'New User';
          
          // Create a user object with proper typing
          const newUser = {
            id: data.session.user.id,
            email: userEmail || '', // Ensure email is not undefined
            name: userName,
            full_name: userName,
            onboard_success: false
          };
          
          const { error: insertError } = await supabase
            .from('users')
            .insert(newUser);
            
          if (insertError) {
            console.error('Error creating user record:', insertError);
          }
          
          // Redirect new users to onboarding
          return NextResponse.redirect(new URL('/onboarding', request.url));
        } 
        
        // Check if user has a household already
        if (existingUser && !existingUser.household_id) {
          // No household yet, redirect to onboarding
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
        
        if (existingUser && !existingUser.onboard_success) {
          // User exists but hasn't completed onboarding
          return NextResponse.redirect(new URL('/onboarding', request.url));
        }
      }
      
      // Default: redirect to dashboard when we have a successful session and completed onboarding
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (err) {
      console.error('Error in auth callback:', err);
      // In case of error, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  // If no code is present or no session established, redirect to auth callback page
  // which will handle the UI and additional logic
  return NextResponse.redirect(new URL('/auth/callback', request.url));
}