-- Activity log table for WeeConnect admin panel
-- Run this once against your Postgres database.

DROP TABLE IF EXISTS audit_logs;

CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    description TEXT,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for the query patterns the admin logs page uses: newest first,
-- filter by user, filter by action, filter by date range.
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id     ON activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action      ON activity_logs (action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity       ON activity_logs (entity_type, entity_id);

-- Optional: if you want the FK enforced against your real users table, add e.g.:
-- ALTER TABLE activity_logs
--   ADD CONSTRAINT fk_activity_logs_user
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;