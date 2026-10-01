# Deployment Operations — OctoCAT Supply Chain Management

Operational commands for deploying and running the OctoCAT Supply Chain Management application. The current deployment topology, CI/CD flow, and implemented-versus-disabled status are maintained in the canonical Azure DevOps Wiki. Follow the [architecture retrieval and maintenance instructions](../.github/copilot-instructions.md#canonical-architecture-reference).

## SQLite Persistence (API)

- Set `DB_FILE` to a path under persistent storage (e.g., `/home/site/data/app.db` on Linux)
- Ensure the containing directory exists or is created on startup
- Optionally enable WAL with `DB_ENABLE_WAL=true` for better concurrency
- Foreign key enforcement is enabled by default; override with `DB_FOREIGN_KEYS=false` if needed
- For containers (compose/k8s), mount a host or managed volume to persist the DB file

Example env vars for API:
```
DB_FILE=/home/site/data/app.db
DB_ENABLE_WAL=true
DB_FOREIGN_KEYS=true
DB_TIMEOUT=30000
```

## Deployment Process

### Setup Prereqs

- `az cli` (use `brew install az`) and then run `az login` to log in to your Azure subscription
- `gh cli` (use `brew install gh`) and then run `gh login` to log in to your GitHub account

### Backups and Recovery

- Since SQLite is file-based, implement periodic backups of the DB file location
- On Azure Web Apps, use WebJobs or scheduled workflows to copy `/home/site/data/app.db` to blob storage
- For Docker, copy the volume or bind-mount target to backup storage

## Final Checks

- Ensure that infrastructure-as-code files don't have any unused declarations/variables
- Ensure that resources are using the location of the resource group
