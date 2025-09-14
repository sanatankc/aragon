-- Add color field to columns table
ALTER TABLE "columns" ADD COLUMN "color" varchar(7) DEFAULT '#49C4E5' NOT NULL;

-- Update existing columns with their respective colors
UPDATE "columns" SET "color" = '#49C4E5' WHERE "name" = 'Todo';
UPDATE "columns" SET "color" = '#635FC7' WHERE "name" = 'Doing';
UPDATE "columns" SET "color" = '#67E2AE' WHERE "name" = 'Done';
