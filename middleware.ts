import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Database } from './lib/supabase/database.types';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  
  // Don't run middleware on callback route or static files
  if (req.nextUrl.pathname.startsWith('/auth/callback') || 
      req.nextUrl.pathname.includes('.') ||
      req.nextUrl.pathname.startsWith('/_next')) {
    return res;
  }
  
  const supabase = createMiddlewareClient<Database>({ req, res });
  
  // Check auth state
  const { data: { session } } = await supabase.auth.getSession();
  
  // For debugging only
  if (session) {
    console.log('Middleware check:', 
      `Path: ${req.nextUrl.pathname}`, 
      `Authenticated: true`,
      session.user.email
    );
  } else {
    console.log('Middleware check:', 
      `Path: ${req.nextUrl.pathname}`, 
      `Authenticated: false`
    );
  }

  // Define route types
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/dashboard') || 
                         req.nextUrl.pathname.startsWith('/tasks') ||
                         req.nextUrl.pathname.startsWith('/calendar') ||
                         req.nextUrl.pathname.startsWith('/budget') ||
                         req.nextUrl.pathname.startsWith('/household');
  
  const isAuthRoute = req.nextUrl.pathname === '/login' ||
                    req.nextUrl.pathname === '/signup';
  
  const isRootRoute = req.nextUrl.pathname === '/';
  
  const isOnboardingRoute = req.nextUrl.pathname.startsWith('/onboarding');

  // Apply route protection logic
  if (isRootRoute && session) {
    // Check if user has completed onboarding before redirecting
    const { data: userData } = await supabase
      .from('users')
      .select('onboard_success, household_id')
      .eq('id', session.user.id)
      .single();
      
    if (userData?.onboard_success && userData?.household_id) {
      console.log('Redirecting authenticated user from root to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      console.log('Redirecting authenticated user to onboarding');
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }
  
  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !session) {
    console.log('Redirecting unauthenticated user to login');
    return NextResponse.redirect(new URL('/login', req.url));
  } 
  
  // Redirect authenticated users away from auth routes
  if (isAuthRoute && session) {
    // Check if user has completed onboarding before redirecting
    const { data: userData } = await supabase
      .from('users')
      .select('onboard_success, household_id')
      .eq('id', session.user.id)
      .single();
      
    if (userData?.onboard_success && userData?.household_id) {
      console.log('Redirecting authenticated user to dashboard');
      return NextResponse.redirect(new URL('/dashboard', req.url));
    } else {
      console.log('Redirecting authenticated user to onboarding');
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }
  }
  
  // Protect onboarding routes from unauthenticated users
  if (isOnboardingRoute && !session) {
    console.log('Redirecting unauthenticated user from onboarding to login');
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/... (image files)
     * - public/... (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|public).*)',
  ],
};
