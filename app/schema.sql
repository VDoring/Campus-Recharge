-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    points INT DEFAULT 0,
    last_check_in_date DATE,
    streak_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Spots Table
CREATE TABLE spots (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_hidden BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- CheckIns Table
CREATE TABLE check_ins (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    spot_id BIGINT REFERENCES spots(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Timetables Table
CREATE TABLE timetables (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_name TEXT NOT NULL,
    day_of_week INT NOT NULL, -- 0 for Sunday, 1 for Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Function to get congestion level
CREATE OR REPLACE FUNCTION get_all_congestion_levels()
RETURNS TABLE(spot_id BIGINT, congestion_level TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id AS spot_id,
        CASE
            WHEN count(c.id) < 5 THEN '원활'
            WHEN count(c.id) < 10 THEN '보통'
            ELSE '혼잡'
        END AS congestion_level
    FROM spots s
    LEFT JOIN check_ins c ON s.id = c.spot_id AND c.created_at > now() - interval '1 hour'
    GROUP BY s.id;
END;
$$ LANGUAGE plpgsql;

-- Contributions Table
CREATE TABLE contributions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'pending' -- pending, approved, rejected
);

-- Function to handle check-in logic
CREATE OR REPLACE FUNCTION handle_check_in(p_user_id UUID, p_spot_id BIGINT)
RETURNS TABLE(new_points INT, new_streak INT) AS $$
DECLARE
    v_last_check_in_date DATE;
    v_streak_count INT;
    v_today DATE := current_date;
BEGIN
    -- Insert the new check-in
    INSERT INTO check_ins (user_id, spot_id) VALUES (p_user_id, p_spot_id);

    -- Get user's current streak info
    SELECT last_check_in_date, streak_count
    INTO v_last_check_in_date, v_streak_count
    FROM users
    WHERE id = p_user_id;

    -- If user has never checked in or last check-in was not yesterday or today
    IF v_last_check_in_date IS NULL OR (v_last_check_in_date != v_today - 1 AND v_last_check_in_date != v_today) THEN
        v_streak_count := 1;
    -- If last check-in was yesterday
    ELSIF v_last_check_in_date = v_today - 1 THEN
        v_streak_count := v_streak_count + 1;
    -- If last check-in was today, streak doesn't change
    END IF;

    -- Update user record if the check-in is new for today
    IF v_last_check_in_date IS NULL OR v_last_check_in_date != v_today THEN
        UPDATE users
        SET
            points = points + 10 + (v_streak_count * 2), -- 10 points for check-in + bonus for streak
            streak_count = v_streak_count,
            last_check_in_date = v_today
        WHERE id = p_user_id;
    END IF;

    -- Return the new values
    RETURN QUERY
    SELECT points, streak_count FROM users WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
