-- Seed ports data (matching frontend mock data)
INSERT INTO ports (code, name, city, country, type) VALUES
  ('BRU', 'Brussels Airport', 'Brussels', 'Belgium', 'air'),
  ('SIN', 'Singapore Changi', 'Singapore', 'Singapore', 'air'),
  ('FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany', 'air'),
  ('JFK', 'John F. Kennedy', 'New York', 'USA', 'air'),
  ('RTM', 'Port of Rotterdam', 'Rotterdam', 'Netherlands', 'sea'),
  ('SHA', 'Shanghai Port', 'Shanghai', 'China', 'sea'),
  ('BOM', 'Mumbai Airport', 'Mumbai', 'India', 'air'),
  ('DXB', 'Dubai Airport', 'Dubai', 'UAE', 'air'),
  ('BSL', 'Basel Airport', 'Basel', 'Switzerland', 'air'),
  ('NRT', 'Narita Airport', 'Tokyo', 'Japan', 'air'),
  ('AMS', 'Schiphol Airport', 'Amsterdam', 'Netherlands', 'air'),
  ('GRU', 'Guarulhos Airport', 'Sao Paulo', 'Brazil', 'air'),
  ('CDG', 'Charles de Gaulle', 'Paris', 'France', 'air'),
  ('HKG', 'Hong Kong Airport', 'Hong Kong', 'Hong Kong', 'air'),
  ('CPH', 'Copenhagen Airport', 'Copenhagen', 'Denmark', 'air'),
  ('LAX', 'Los Angeles Airport', 'Los Angeles', 'USA', 'air')
ON CONFLICT (code) DO NOTHING;
