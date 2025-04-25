CREATE TABLE device_info (
    device_id BIGSERIAL PRIMARY KEY,
    connection_id VARCHAR(255) NOT NULL,
    device_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE telemetry_data (
    device_id BIGINT NOT NULL REFERENCES device_info(device_id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);