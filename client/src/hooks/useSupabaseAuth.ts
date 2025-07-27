// Supabase auth removed - using custom auth instead
export const useSupabaseAuth = () => ({
  user: null,
  loading: false,
  signOut: () => Promise.resolve()
});