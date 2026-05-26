const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in backend .env!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runDiagnostics() {
  console.log("=== LEENOUT DATABASE DIAGNOSTICS V3 ===");
  console.log("Supabase URL:", supabaseUrl);

  try {
    // 1. Query all projects
    console.log("\n1. Querying projects...");
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('*');

    if (projError) {
      console.error("Error fetching projects:", projError.message, projError.details || "");
    } else {
      console.log(`Found ${projects.length} projects in database:`);
      projects.forEach(p => console.log(` - ID: ${p.id}, Name: ${p.name}, OwnerID: ${p.owner_id}`));
    }

    // 2. Query all project files
    console.log("\n2. Querying project_files...");
    const { data: files, error: filesError } = await supabase
      .from('project_files')
      .select('*');

    if (filesError) {
      console.error("Error fetching project_files:", filesError.message, filesError.details || "");
    } else {
      console.log(`Found ${files.length} project files in total:`);
    }

  } catch (err) {
    console.error("Diagnostics crash:", err);
  }
}

runDiagnostics();
