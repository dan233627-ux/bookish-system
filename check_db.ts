import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const newDbInvestment = {
    user_id: 'd00795a5-2050-45fd-b1b3-717daa444597',
    plan_id: '24h-1',
    plan_label: '24 Hours Plan',
    category: '24h',
    capital: 500,
    roi: 4200,
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    duration_hours: 24,
    status: 'pending',
    screenshot_url: null,
    payment_method: 'Crypto'
  };

  try {
    console.log('Attempting to insert investment with status "pending"...');
    const { data, error } = await supabase
      .from('investments')
      .insert(newDbInvestment)
      .select();

    if (error) {
      console.error('Insert failed with error:', error);
    } else {
      console.log('Insert succeeded! Data:', data);
      
      // Clean up the inserted test row
      if (data && data.length > 0) {
        const id = data[0].id;
        console.log(`Cleaning up test row with ID ${id}...`);
        const { error: delError } = await supabase
          .from('investments')
          .delete()
          .eq('id', id);
        if (delError) {
          console.error('Clean up failed:', delError);
        } else {
          console.log('Clean up succeeded.');
        }
      }
    }
  } catch (err) {
    console.error('Execution failed:', err);
  }
}

testInsert();
