-- Add missing is_published column
ALTER TABLE courses ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT false;

-- Sync is_published from status column for existing rows
UPDATE courses SET is_published = (status = 'published') WHERE status IS NOT NULL;

-- Add materials_included as alias column
ALTER TABLE courses ADD COLUMN IF NOT EXISTS materials_included text DEFAULT '';

-- Copy existing materials data
UPDATE courses SET materials_included = materials WHERE materials IS NOT NULL AND materials_included = '';
