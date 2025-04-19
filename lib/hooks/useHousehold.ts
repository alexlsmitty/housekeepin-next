import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthContext } from '@/components/AuthProvider';
import { Household, ExtendedHouseholdMember, ApiError } from '@/types/database';

// Interface for Supabase query responses
interface UserHouseholdData {
  household_id: string;
}

interface HouseholdMemberData {
  id: string;
  household_id: string;
  user_id: string;
  role: string | null;
  joined_at: string | null;
  users: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

export const useHousehold = () => {
  const { user } = useAuthContext();
  const [household, setHousehold] = useState<Household | null>(null);
  const [members, setMembers] = useState<ExtendedHouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchHousehold = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // First, get the user's household id
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('household_id')
          .eq('id', user.id as string)
          .single();

        if (userError) throw userError;
        
        if (!userData?.household_id) {
          // No household assigned to this user
          setMembers([]);
          setHousehold(null);
          setLoading(false);
          return;
        }

        // Fetch household data
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('id', userData.household_id as string)
          .single();

        if (householdError) throw householdError;
        
        setHousehold(householdData as Household);
        
        // Fetch household members with their roles
        const { data: householdMembersData, error: membersError } = await supabase
          .from('household_members')
          .select('*, users:user_id(id, name, email)')
          .eq('household_id', userData.household_id as string);
          
        if (membersError) throw membersError;
        
        // Transform the data to a more usable format
        const membersWithRoles: ExtendedHouseholdMember[] = (householdMembersData as HouseholdMemberData[]).map((memberRecord) => ({
          id: memberRecord.id,
          household_id: memberRecord.household_id,
          user_id: memberRecord.user_id,
          role: memberRecord.role,
          joined_at: memberRecord.joined_at,
          name: memberRecord.users?.name || 'Unnamed User',
          email: memberRecord.users?.email
        }));
        
        setMembers(membersWithRoles);
      } catch (err) {
        console.error('Error fetching household data:', err);
        setError({
          message: (err as Error)?.message || 'An unknown error occurred',
          status: (err as any)?.status
        });
      } finally {
        setLoading(false);
      }
    };

    fetchHousehold();
  }, [user]);

  // Function to refresh household data
  const refreshHousehold = async () => {
    if (!user) {
      return;
    }
    
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('household_id')
        .eq('id', user.id as string)
        .single();

      if (userError) throw userError;
      
      if (!userData?.household_id) {
        setMembers([]);
        setHousehold(null);
        setLoading(false);
        return;
      }

      // Fetch household data
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', userData.household_id as string)
        .single();

      if (householdError) throw householdError;
      
      setHousehold(householdData as Household);
      
      // Fetch household members with their roles
      const { data: householdMembersData, error: membersError } = await supabase
        .from('household_members')
        .select('*, users:user_id(id, name, email)')
        .eq('household_id', userData.household_id as string);
        
      if (membersError) throw membersError;
      
      // Transform the data to a more usable format
      const membersWithRoles: ExtendedHouseholdMember[] = (householdMembersData as HouseholdMemberData[]).map((memberRecord) => ({
        id: memberRecord.id,
        household_id: memberRecord.household_id,
        user_id: memberRecord.user_id,
        role: memberRecord.role,
        joined_at: memberRecord.joined_at,
        name: memberRecord.users?.name || 'Unnamed User',
        email: memberRecord.users?.email
      }));
      
      setMembers(membersWithRoles);
    } catch (err) {
      console.error('Error refreshing household data:', err);
      setError({
        message: (err as Error)?.message || 'An unknown error occurred',
        status: (err as any)?.status
      });
    } finally {
      setLoading(false);
    }
  };

  return { household, members, loading, error, refreshHousehold };
};