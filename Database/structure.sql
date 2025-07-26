CREATE TABLE devices (
    id BIGSERIAL PRIMARY KEY,
    connection_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE device_details (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    operator VARCHAR(255) NOT NULL,
    product VARCHAR(255) NOT NULL
);

CREATE TABLE telemetry (
    device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_pieces (
    id BIGSERIAL PRIMARY KEY,
    device_id BIGINT NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_pieces INT DEFAULT 0,
    UNIQUE(device_id, date)
);