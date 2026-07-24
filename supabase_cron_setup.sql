-- Enable pg_cron extension (run this in Supabase SQL Editor)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily notification at 7:00 AM (day-of reminder)
SELECT cron.schedule(
  'day-of-appointment-reminder',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-appointment-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := jsonb_build_object('type', 'day-of')::text
  );
  $$
);

-- Schedule notification check every minute (15-min before reminder)
SELECT cron.schedule(
  '15min-appointment-reminder',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-appointment-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY'
    ),
    body := jsonb_build_object('type', '15min')::text
  );
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule (if needed):
-- SELECT cron.unschedule('day-of-appointment-reminder');
-- SELECT cron.unschedule('15min-appointment-reminder');
