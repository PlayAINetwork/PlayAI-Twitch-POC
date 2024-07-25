CREATE TABLE "task"
(
    "id"            CHAR(24) PRIMARY KEY,
    "wallet"        CHAR(42) ,
    "s3_link" VARCHAR(127), 
    "verifed"     VARCHAR(127),
    "created_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE "node"
(
    "id"            CHAR(24) PRIMARY KEY,
    "wallet"        CHAR(42) ,
    "available"     VARCHAR(127),
    "ip"     VARCHAR(127),
    "port"     INTEGER,
    "token_id"      INTEGER,
    "retries"       INTEGER DEFAULT 0,
    "status"      VARCHAR(127),
    "created_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "up_time"   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP

);

CREATE TABLE "assigned"
(
    "id"            CHAR(24) PRIMARY KEY,
    "task_id"    CHAR(24)                 NOT NULL,
    "node_id"    CHAR(24)                 NOT NULL,
    "wallet"        CHAR(42) ,
    "verifed"     VARCHAR(127),
    FOREIGN KEY (task_id) REFERENCES task (id),
    FOREIGN KEY (node_id) REFERENCES "node" (id),
    "created_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP

)

