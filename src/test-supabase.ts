import { supabase } from './supabase';

// Test Supabase connection
async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test select on daily_records table
    const { data, error } = await supabase
      .from('daily_records')
      .select('*')
      .limit(1);
    
    console.log('Select result:', { data, error });
    
    if (error) {
      console.error('Supabase error:', error);
    } else {
      console.log('Connection successful!');
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection();
