-- SynthFocus Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sessions table
CREATE TABLE public.sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    concept TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'complete', 'error')),
    personas JSONB NOT NULL DEFAULT '[]',
    include_moderator BOOLEAN NOT NULL DEFAULT TRUE,
    include_devil_advocate BOOLEAN NOT NULL DEFAULT TRUE,
    include_analyst BOOLEAN NOT NULL DEFAULT TRUE,
    max_rounds INTEGER NOT NULL DEFAULT 5,
    final_report TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Messages table
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    agent TEXT NOT NULL,
    content TEXT NOT NULL,
    node TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_created_at ON public.sessions(created_at DESC);
CREATE INDEX idx_messages_session_id ON public.messages(session_id);
CREATE INDEX idx_messages_session_created ON public.messages(session_id, created_at);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Service role full access to profiles" ON public.profiles
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for sessions
CREATE POLICY "Users can view own sessions" ON public.sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sessions" ON public.sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sessions" ON public.sessions
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role full access to sessions" ON public.sessions
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for messages
CREATE POLICY "Users can view own session messages" ON public.messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can insert to own sessions" ON public.messages
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id AND user_id = auth.uid())
    );

CREATE POLICY "Service role full access to messages" ON public.messages
    FOR ALL USING (auth.role() = 'service_role');

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        CASE WHEN NEW.email = 'admin@synthfocus.app' THEN 'admin' ELSE 'user' END,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
