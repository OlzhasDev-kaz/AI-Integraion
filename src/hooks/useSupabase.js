import { useState, useEffect } from 'react';
import { supabase, auth, db } from '../lib/supabase';

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

        // Create profile on sign up
        if (event === 'SIGNED_UP' && session?.user) {
          await createUserProfile(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (user) => {
    try {
      const { error } = await db.createProfile({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email,
        preferences: {
          language: 'ru',
          aiModel: 'gpt-4',
          autoSave: true,
          voiceEnabled: true,
          accessibilityMode: false,
          notificationDuration: 5000,
          theme: 'light'
        },
        api_keys: {}
      });

      if (error) {
        console.error('Error creating profile:', error);
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  return {
    user,
    session,
    loading,
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    supabase
  };
};

export const useProfile = (userId) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await db.getProfile(userId);
        
        if (error) {
          setError(error);
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const updateProfile = async (updates) => {
    try {
      const { data, error } = await db.updateProfile(userId, updates);
      if (error) {
        setError(error);
        return { error };
      }
      setProfile(data);
      return { data };
    } catch (err) {
      setError(err);
      return { error: err };
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile
  };
};

export const useBusinessPlans = (userId) => {
  const [businessPlans, setBusinessPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchBusinessPlans = async () => {
      try {
        setLoading(true);
        const { data, error } = await db.getBusinessPlans(userId);
        
        if (error) {
          setError(error);
        } else {
          setBusinessPlans(data || []);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessPlans();
  }, [userId]);

  const createBusinessPlan = async (plan) => {
    try {
      const { data, error } = await db.createBusinessPlan({
        ...plan,
        user_id: userId
      });
      
      if (error) {
        setError(error);
        return { error };
      }
      
      setBusinessPlans(prev => [data, ...prev]);
      return { data };
    } catch (err) {
      setError(err);
      return { error: err };
    }
  };

  const updateBusinessPlan = async (planId, updates) => {
    try {
      const { data, error } = await db.updateBusinessPlan(planId, updates);
      
      if (error) {
        setError(error);
        return { error };
      }
      
      setBusinessPlans(prev => 
        prev.map(plan => plan.id === planId ? data : plan)
      );
      return { data };
    } catch (err) {
      setError(err);
      return { error: err };
    }
  };

  const deleteBusinessPlan = async (planId) => {
    try {
      const { error } = await db.deleteBusinessPlan(planId);
      
      if (error) {
        setError(error);
        return { error };
      }
      
      setBusinessPlans(prev => prev.filter(plan => plan.id !== planId));
      return { success: true };
    } catch (err) {
      setError(err);
      return { error: err };
    }
  };

  return {
    businessPlans,
    loading,
    error,
    createBusinessPlan,
    updateBusinessPlan,
    deleteBusinessPlan
  };
};

export const useChatMessages = (userId, businessPlanId = null) => {
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchChatMessages = async () => {
      try {
        setLoading(true);
        const { data, error } = await db.getChatMessages(userId, businessPlanId);
        
        if (error) {
          setError(error);
        } else {
          setChatMessages(data || []);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatMessages();
  }, [userId, businessPlanId]);

  const createChatMessage = async (message) => {
    try {
      const { data, error } = await db.createChatMessage({
        ...message,
        user_id: userId,
        business_plan_id: businessPlanId
      });
      
      if (error) {
        setError(error);
        return { error };
      }
      
      setChatMessages(prev => [...prev, data]);
      return { data };
    } catch (err) {
      setError(err);
      return { error: err };
    }
  };

  const clearChatMessages = async () => {
    try {
      const { error } = await db.deleteChatMessages(userId, businessPlanId);
      
      if (error) {
        setError(error);
        return { error };
      }
      
      setChatMessages([]);
      return { success: true };
    } catch (err) {
      setError(err);
      return { error: err };
    }
  };

  return {
    chatMessages,
    loading,
    error,
    createChatMessage,
    clearChatMessages
  };
};

export const useUploadedFiles = (userId) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUploadedFiles = async () => {
      try {
        setLoading(true);
        const { data, error } = await db.getUploadedFiles(userId);
        
        if (error) {
          setError(error);
        } else {
          setUploadedFiles(data || []);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUploadedFiles();
  }, [userId]);

  const createUploadedFile = async (file) => {
    try {
      const { data, error } = await db.createUploadedFile({
        ...file,
        user_id: userId
      });
      
      if (error) {
        setError(error);
        return { error };
      }
      
      setUploadedFiles(prev => [data, ...prev]);
      return { data };
    } catch (err) {
      setError(err);
      return { error: err };
    }
  };

  const deleteUploadedFile = async (fileId) => {
    try {
      const { error } = await db.deleteUploadedFile(fileId);
      
      if (error) {
        setError(error);
        return { error };
      }
      
      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
      return { success: true };
    } catch (err) {
      setError(err);
      return { error: err };
    }
  };

  const clearUploadedFiles = async () => {
    try {
      const { error } = await db.deleteAllUploadedFiles(userId);
      
      if (error) {
        setError(error);
        return { error };
      }
      
      setUploadedFiles([]);
      return { success: true };
    } catch (err) {
      setError(err);
      return { error: err };
    }
  };

  return {
    uploadedFiles,
    loading,
    error,
    createUploadedFile,
    deleteUploadedFile,
    clearUploadedFiles
  };
};