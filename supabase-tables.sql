-- Notification System Tables for Supabase

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  type VARCHAR(50) NOT NULL DEFAULT 'announcement',
  sender_id UUID REFERENCES users(id),
  recipient_id UUID REFERENCES users(id),
  is_read BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'sent',
  send_email BOOLEAN DEFAULT FALSE,
  send_wechat BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
  FOR SELECT USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Allow sending notifications
CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (sender_id = auth.uid() OR auth.uid() IS NOT NULL);

-- Allow updating own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Repairs table
CREATE TABLE IF NOT EXISTS repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id),
  tenant_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'normal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;

-- Allow landlords to manage repairs
CREATE POLICY "Landlords can manage repairs" ON repairs
  FOR ALL USING (auth.uid() IS NOT NULL);
