import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthContext } from '@/components/AuthProvider';

export const useHousehold = () => {
  const { user } = useAuthContext();
  const [household, setHousehold] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        
        if (!userData?.household_id) {
          setHousehold(null);
          setLoading(false);
          return;
        }

        // Fetch household data
        const { data: householdData, error: householdError } = await supabase
          .from('households')
          .select('*')
          .eq('id', userData.household_id)
          .single();

        if (householdError) throw householdError;
        
        setHousehold(householdData);
        
        // Fetch household members with their roles
        const { data: householdMembersData, error: membersError } = await supabase
          .from('household_members')
          .select('*, users:user_id(id, name, email)')
          .eq('household_id', userData.household_id);
          
        if (membersError) throw membersError;
        
        // Transform the data to a more usable format
        const membersWithRoles = householdMembersData.map(memberRecord => ({
          id: memberRecord.id,
          user_id: memberRecord.user_id,
          role: memberRecord.role,
          joined_at: memberRecord.joined_at,
          name: memberRecord.users?.name || 'Unnamed User',
          email: memberRecord.users?.email
        }));
        
        setMembers(membersWithRoles || []);
      } catch (err) {
        console.error('Error fetching household data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHousehold();
  }, [user]);

  // Function to refresh household data
  const refreshHousehold = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('household_id')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      
      if (!userData?.household_id) {
        setHousehold(null);
        setLoading(false);
        return;
      }

      // Fetch household data
      const { data: householdData, error: householdError } = await supabase
        .from('households')
        .select('*')
        .eq('id', userData.household_id)
        .single();

      if (householdError) throw householdError;
      
      setHousehold(householdData);
      
      // Fetch household members with their roles
      const { data: householdMembersData, error: membersError } = await supabase
        .from('household_members')
        .select('*, users:user_id(id, name, email)')
        .eq('household_id', userData.household_id);
        
      if (membersError) throw membersError;
      
      // Transform the data to a more usable format
      const membersWithRoles = householdMembersData.map(memberRecord => ({
        id: memberRecord.id,
        user_id: memberRecord.user_id,
        role: memberRecord.role,
        joined_at: memberRecord.joined_at,
        name: memberRecord.users?.name || 'Unnamed User',
        email: memberRecord.users?.email
      }));
      
      setMembers(membersWithRoles || []);
    } catch (err) {
      console.error('Error refreshing household data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { household, members, loading, error, refreshHousehold };
};
