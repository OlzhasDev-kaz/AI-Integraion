import { useState, useEffect } from 'react';
import { supabase, auth } from '../lib/supabase';

export const useSupabase = () => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Database operations
  const createProfile = async (userData) => {
    if (!user) return { error: new Error('No authenticated user') };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        name: userData.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        preferences: userData.preferences || {},
        api_keys: userData.api_keys || {}
      })
      .select()
      .single();
    
    return { data, error };
  };

  const getProfile = async () => {
    if (!user) return { data: null, error: new Error('No authenticated user') };
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    
    return { data, error };
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('No authenticated user') };
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    return { data, error };
  };

  const createChatMessage = async (messageData) => {
    if (!user) return { error: new Error('No authenticated user') };
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        ...messageData
      })
      .select()
      .single();
    
    return { data, error };
  };

  const getChatMessages = async () => {
    if (!user) return { data: [], error: new Error('No authenticated user') };
    
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    
    return { data: data || [], error };
  };

  const clearChatMessages = async () => {
    if (!user) return { error: new Error('No authenticated user') };
    
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', user.id);
    
    return { error };
  };

  const createBusinessPlan = async (planData) => {
    if (!user) return { error: new Error('No authenticated user') };
    
    const { data, error } = await supabase
      .from('business_plans')
      .insert({
        user_id: user.id,
        ...planData
      })
      .select()
      .single();
    
    return { data, error };
  };

  const getBusinessPlans = async () => {
    if (!user) return { data: [], error: new Error('No authenticated user') };
    
    const { data, error } = await supabase
      .from('business_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    return { data: data || [], error };
  };

  const createUploadedFile = async (fileData) => {
    if (!user) return { error: new Error('No authenticated user') };
    
    const { data, error } = await supabase
      .from('uploaded_files')
      .insert({
        user_id: user.id,
        ...fileData
      })
      .select()
      .single();
    
    return { data, error };
  };

  const getUploadedFiles = async () => {
    if (!user) return { data: [], error: new Error('No authenticated user') };
    
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    return { data: data || [], error };
  };

  const deleteUploadedFile = async (fileId) => {
    if (!user) return { error: new Error('No authenticated user') };
    
    const { error } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', user.id);
    
    return { error };
  };

  const clearUploadedFiles = async () => {
    if (!user) return { error: new Error('No authenticated user') };
    
    const { error } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('user_id', user.id);
    
    return { error };
  };

  return {
    user,
    session,
    loading,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    supabase,
    // Database operations
    createProfile,
    getProfile,
    updateProfile,
    createChatMessage,
    getChatMessages,
    clearChatMessages,
    createBusinessPlan,
    getBusinessPlans,
    createUploadedFile,
    getUploadedFiles,
    deleteUploadedFile,
    clearUploadedFiles
  };
};