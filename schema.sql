-- Step 1: Lucky Draw signs pool schema
-- Table: 10,000 pre-generated signs. Do NOT change distribution or ID format.

CREATE TABLE IF NOT EXISTS signs (
  id         VARCHAR(20) PRIMARY KEY COMMENT 'Sign ID: S<levelNumber>-<runningIndex>, e.g. S01-0001',
  level      INT         NOT NULL COMMENT '0=Empty, 1=Top-Top, 2=Top, 3=Special',
  type       VARCHAR(20) NOT NULL COMMENT 'Empty|Top-Top|Top|Special',
  reward_code VARCHAR(20) NOT NULL COMMENT 'R01|R02|R03|EMPTY',
  is_drawn   BOOLEAN     NOT NULL DEFAULT FALSE COMMENT 'Whether this sign has been drawn'
);

-- Index for draw logic (Step 2): find next undrawn sign by level/order
CREATE INDEX idx_signs_level_drawn ON signs (level, is_drawn);
