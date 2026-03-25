-- Seed carriers data (matching frontend mock data)
INSERT INTO carriers (name, gdp_certified, modes) VALUES
  ('DHL Express', true, ARRAY['air', 'road']),
  ('FedEx Express', true, ARRAY['air', 'road']),
  ('UPS Healthcare', true, ARRAY['air', 'road']),
  ('Lufthansa Cargo', true, ARRAY['air']),
  ('Emirates SkyCargo', true, ARRAY['air']),
  ('Swiss WorldCargo', true, ARRAY['air']),
  ('KLM Cargo', true, ARRAY['air']),
  ('Air France Cargo', true, ARRAY['air']),
  ('Maersk Line', true, ARRAY['sea']),
  ('MSC', false, ARRAY['sea']),
  ('CMA CGM', true, ARRAY['sea']),
  ('Hapag-Lloyd', false, ARRAY['sea'])
ON CONFLICT DO NOTHING;
