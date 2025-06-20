
-- Update the admin user to mark email as confirmed (fixing the generated column issue)
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'admin@bloodconnect.com';
