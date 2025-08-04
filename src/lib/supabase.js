import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up your Supabase connection.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Auth helpers
export const auth = {
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: () => {
    return supabase.auth.getUser();
  },

  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Database helpers
export const db = {
  // Profiles
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  createProfile: async (profile) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();
    return { data, error };
  },

  // Business Plans
  getBusinessPlans: async (userId) => {
    const { data, error } = await supabase
      .from('business_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  createBusinessPlan: async (plan) => {
    const { data, error } = await supabase
      .from('business_plans')
      .insert([plan])
      .select()
      .single();
    return { data, error };
  },

  updateBusinessPlan: async (planId, updates) => {
    const { data, error } = await supabase
      .from('business_plans')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', planId)
      .select()
      .single();
    return { data, error };
  },

  deleteBusinessPlan: async (planId) => {
    const { error } = await supabase
      .from('business_plans')
      .delete()
      .eq('id', planId);
    return { error };
  },

  // Chat Messages
  getChatMessages: async (userId, businessPlanId = null) => {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (businessPlanId) {
      query = query.eq('business_plan_id', businessPlanId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  createChatMessage: async (message) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert([message])
      .select()
      .single();
    return { data, error };
  },

  deleteChatMessages: async (userId, businessPlanId = null) => {
    let query = supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId);

    if (businessPlanId) {
      query = query.eq('business_plan_id', businessPlanId);
    }

    const { error } = await query;
    return { error };
  },

  // Uploaded Files
  getUploadedFiles: async (userId) => {
    const { data, error } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  createUploadedFile: async (file) => {
    const { data, error } = await supabase
      .from('uploaded_files')
      .insert([file])
      .select()
      .single();
    return { data, error };
  },

  deleteUploadedFile: async (fileId) => {
    const { error } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('id', fileId);
    return { error };
  },

  deleteAllUploadedFiles: async (userId) => {
    const { error } = await supabase
      .from('uploaded_files')
      .delete()
      .eq('user_id', userId);
    return { error };
  }
};

// Real-time subscriptions
export const subscriptions = {
  subscribeToBusinessPlans: (userId, callback) => {
    return supabase
      .channel('business_plans_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'business_plans',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  subscribeToChatMessages: (userId, callback) => {
    return supabase
      .channel('chat_messages_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe();
  },

  unsubscribe: (subscription) => {
    return supabase.removeChannel(subscription);
  }
};