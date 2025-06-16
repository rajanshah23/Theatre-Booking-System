// scripts/storageSetup.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("❌ Missing environment variables!");
  console.error("   Make sure you have a .env file with:");
  console.error("   SUPABASE_URL=your-project-url");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false }
});

async function setupBucket() {
  try {
    console.log("🔍 Checking existing buckets...");
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) throw listError;
    
    if (buckets.some(b => b.name === 'show-images')) {
      console.log("ℹ️ Bucket 'show-images' already exists. Skipping creation.");
      return;
    }

    console.log("🛠 Creating bucket 'show-images'...");
    
    // Create bucket
    const { data, error } = await supabase.storage.createBucket("show-images", {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
    });

    if (error) throw error;
    console.log("✅ Bucket created successfully!");
    console.log(data);
  } catch (error: any) {
    console.error("❌ Setup failed:");
    console.error(error.message || error);
    process.exit(1);
  }
}

setupBucket();