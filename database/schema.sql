CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL CHECK (length(title) > 0 AND length(title) <= 500),
    description TEXT,
    status task_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (length(title) > 0 AND length(title) <= 500),
    description TEXT,
    status task_status NOT NULL DEFAULT 'pending',
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_task_order UNIQUE (task_id, order_index)
);

CREATE INDEX idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX idx_subtasks_order ON subtasks(task_id, order_index);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_subtasks_status ON subtasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subtasks_updated_at 
    BEFORE UPDATE ON subtasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
