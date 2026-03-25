const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hedvkncylfkudabbtpzt.supabase.co';
const supabaseKey = 'sb_publishable_0kftv5iPegZ886vU3UFD6Q_5vyxpJpe';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('Creating notification tables...');

  // Create notifications table
  const { error: notifError } = await supabase.from('notifications').insert({
    id: '00000000-0000-0000-0000-000000000001',
    title: 'test',
    description: 'test',
    type: 'announcement',
    sender_id: 'd3ee9b5c-397b-45d3-ae9d-7919df28a8d4',
    recipient_id: 'd3ee9b5c-397b-45d3-ae9d-7919df28a8d4',
    is_read: false,
    status: 'sent'
  }).onConflict('id').ignore();

  // Create notification_types table
  const { error: typeError } = await supabase.from('notification_types').insert({
    id: 'rent_reminder',
    name: '租金提醒',
    description: '租金到期提醒'
  }).onConflict('id').ignore();

  console.log('Tables created or already exist');
  console.log('Done!');
}

createTables().catch(console.error);
