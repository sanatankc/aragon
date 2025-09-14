# Aragon.ai Full Stack Project

This is a task management app built with Next.js, Drizzle ORM, and Supabase.

## Getting Started

1.  **Supabase Setup:**
    - Create a new project in Supabase.
    - Go to Project Settings -> Database and copy the Connection String (for `psql`).
    - Go to Project Settings -> API and copy your Project URL and `anon` public key.

2.  **Environment Variables:** Create a `.env` file in the root directory with the following:

    ```
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    DATABASE_URL=YOUR_SUPABASE_DATABASE_URL
    NODE_ENV=development
    ```
    Replace the placeholders with your actual Supabase project details.

3.  **Install dependencies:**

    ```bash
    npm install
    ```

4.  **Create the database schema:**

    ```bash
    npm run db:push
    ```

5.  **Seed the database:**

    ```bash
    npm run seed
    ```

6.  **Run the development server:**

    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
