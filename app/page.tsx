import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = createServerSupabaseClient();
  
  try {
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    console.log('Home page session check:', 
      session ? `Authenticated as ${session.user.email}` : 'No session');
    
    // Redirect to appropriate page based on auth state
    if (!session) {
      redirect('/login');
    } else {
      try {
        // Check if user has completed onboarding
        const { data, error } = await supabase
          .from('users')
          .select('onboard_success')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          
          // If user not found, they might need to create a profile
          if (error.code === 'PGRST116') {
            console.log('Creating profile for new OAuth user');
            await supabase
              .from('users')
              .insert([{ 
                id: session.user.id, 
                email: session.user.email,
                onboard_success: false
              }]);
            
            redirect('/onboarding');
          } else {
            redirect('/login');
          }
        }

        if (data?.onboard_success) {
          redirect('/dashboard');
        } else {
          redirect('/onboarding');
        }
      } catch (err) {
        console.error('Error in home page:', err);
        redirect('/login');
      }
    }
  } catch (err) {
    console.error('Unexpected error in home page:', err);
    redirect('/login');
  }
  
  // This won't be reached, but we need to return something
  return null;
}
