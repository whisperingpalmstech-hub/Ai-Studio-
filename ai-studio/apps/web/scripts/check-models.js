
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkModels() {
    const { data, error } = await supabase
        .from('models')
        .select('*');

    if (error) {
        console.error('Error fetching models:', error);
        return;
    }

    console.log(`Found ${data.length} models total.`);
    data.forEach(m => {
        console.log(`ID: ${m.id}, Name: ${m.name}, Type: ${m.type}, Public: ${m.is_public}, System: ${m.is_system}`);
    });
}

checkModels();
