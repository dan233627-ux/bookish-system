-- Ensure Supabase storage RLS policies allow authenticated users to upload screenshots to the deposit-screenshots bucket.
-- Run this in the Supabase Storage UI or via your project's storage policy settings.

-- Supabase storage bucket policies are configured in the Storage UI, not usually via SQL.
-- If your bucket has hardened access rules, allow authenticated uploads to this bucket.
-- Example policy for authenticated users:
--   allow read, write: if request.auth.uid() != null;
-- Or via the UI set bucket access to allow authenticated users.
