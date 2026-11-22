CREATE TABLE contact_messages (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('Job Opportunity', 'Freelance Project', 'Collaboration', 'Other')),
  message TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
