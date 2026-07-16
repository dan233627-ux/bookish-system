import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.VITE_SUPABASE_SCREENSHOT_BUCKET || 'deposit-screenshots';

if (!supabaseUrl) {
  console.error('Missing SUPABASE_URL or VITE_SUPABASE_URL in environment.');
  process.exit(1);
}

if (!supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log(`Creating Supabase storage bucket: ${bucketName}`);

  const { data: existingBucket, error: getError } = await supabase.storage.getBucket(bucketName);
  if (existingBucket) {
    console.log(`Bucket already exists: ${bucketName}`);
    process.exit(0);
  }

  if (getError && getError.status !== 404) {
    console.error('Failed to inspect existing bucket:', getError.message || getError);
    process.exit(1);
  }

  const { data, error } = await supabase.storage.createBucket(bucketName, {
    public: true,
  });

  if (error) {
    if (error.message?.includes('already exists')) {
      console.log(`Bucket already exists: ${bucketName}`);
      process.exit(0);
    }
    console.error('Failed to create bucket:', error.message || error);
    process.exit(1);
  }

  console.log('Bucket created successfully:', data?.name || bucketName);
  console.log('Public bucket URL prefix:', `${supabaseUrl.replace(/\/$/, '')}/storage/v1/object/public/${bucketName}/`);
}

main().catch((error) => {
  console.error('Unexpected error while creating bucket:', error);
  process.exit(1);
});
