# 🔒 Sensitive Data Protection Guide

## Table of Contents
1. [Overview](#overview)
2. [Files Protected](#files-protected)
3. [Environment Variables](#environment-variables)
4. [Git Configuration](#git-configuration)
5. [Best Practices](#best-practices)
6. [Emergency Response](#emergency-response)

---

## Overview

This project uses multiple layers of protection to prevent sensitive data from being exposed:

- ✅ **`.gitignore`** - Prevents sensitive files from being committed
- ✅ **`.env.example`** - Template files without actual secrets
- ✅ **httpOnly Cookies** - Prevents XSS token theft
- ✅ **CSRF Protection** - Prevents cross-site attacks
- ✅ **Environment Separation** - Different configs for dev/staging/prod

---

## Files Protected

### 🚫 NEVER Commit These Files

```
.env                          # Environment variables with secrets
.env.local                    # Local overrides
.env.production               # Production secrets
backend/.env                  # Backend secrets
*.pem, *.key, *.cert         # SSL certificates and private keys
config/secrets.json           # Configuration with credentials
cookies.txt                   # Session cookies
*.db, *.sqlite               # Database files with data
id_rsa, id_rsa.pub           # SSH keys
```

### ✅ Safe to Commit

```
.env.example                  # Template without secrets
.gitignore                    # Protection rules
README.md                     # Public documentation
package.json                  # Dependency list (no secrets)
```

---

## Environment Variables

### Frontend (`/.env`)

Create from template:
```bash
cp .env.example .env
```

Required variables:
```bash
VITE_MAPTILER_KEY=your_actual_api_key_here
```

**How to get MapTiler API Key:**
1. Visit https://www.maptiler.com/cloud/
2. Sign up for free account
3. Create new API key
4. Copy key to `.env` file

### Backend (`/backend/.env`)

Create from template:
```bash
cd backend
cp .env.example .env
```

Required variables:
```bash
# Database credentials
DB_PASSWORD=your_secure_postgres_password

# JWT secret (generate with command below)
SECRET_KEY=your_generated_secret_key
```

**Generate secure SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Git Configuration

### Verify Protection

Check if `.env` files are ignored:
```bash
git status --ignored
```

Should show:
```
Ignored files:
  .env
  backend/.env
```

### Remove Accidentally Committed Secrets

If you accidentally committed sensitive files:

**1. Remove from Git history:**
```bash
# Remove file from Git (keeps local copy)
git rm --cached .env
git rm --cached backend/.env

# Commit the removal
git commit -m "Remove sensitive files from tracking"
```

**2. For files already pushed to remote:**
```bash
# Use BFG Repo-Cleaner (recommended)
bfg --delete-files .env
bfg --delete-files '*.env'
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Or use git filter-branch (slower)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all
```

**3. Invalidate exposed secrets:**
- Rotate database passwords
- Generate new JWT SECRET_KEY
- Revoke and recreate API keys
- Update all deployed environments

---

## Best Practices

### 1. Environment Separation

**Development:**
```bash
# Use .env.local for local overrides
VITE_API_BASE_URL=http://localhost:8000
DB_PASSWORD=dev_password
SECRET_KEY=dev_secret_key_not_for_production
```

**Production:**
```bash
# Use environment variables or secret management
VITE_API_BASE_URL=https://api.yourdomain.com
DB_PASSWORD=${AWS_SECRET_DB_PASSWORD}
SECRET_KEY=${AWS_SECRET_JWT_KEY}
COOKIE_SECURE=true
```

### 2. Secret Management Services

For production, use dedicated secret management:

**AWS Secrets Manager:**
```python
import boto3
client = boto3.client('secretsmanager')
secret = client.get_secret_value(SecretId='prod/db/password')
DB_PASSWORD = secret['SecretString']
```

**HashiCorp Vault:**
```python
import hvac
client = hvac.Client(url='https://vault.yourdomain.com')
secret = client.secrets.kv.v2.read_secret_version(path='db/password')
DB_PASSWORD = secret['data']['data']['password']
```

**Google Cloud Secret Manager:**
```python
from google.cloud import secretmanager
client = secretmanager.SecretManagerServiceClient()
name = f"projects/{project_id}/secrets/db-password/versions/latest"
response = client.access_secret_version(request={"name": name})
DB_PASSWORD = response.payload.data.decode('UTF-8')
```

### 3. Rotation Strategy

**Rotate secrets regularly:**

| Secret Type | Rotation Frequency | Priority |
|------------|-------------------|----------|
| JWT SECRET_KEY | Every 90 days | High |
| Database Password | Every 90 days | High |
| API Keys | Every 180 days | Medium |
| SSL Certificates | Before expiry | Critical |

### 4. Access Control

**Limit who can access secrets:**

```bash
# Set restrictive permissions
chmod 600 .env
chmod 600 backend/.env

# Check permissions
ls -la .env
# Should show: -rw------- (read/write for owner only)
```

### 5. Audit Logging

**Monitor secret access:**
```python
import logging

logger = logging.getLogger('security')

def load_secret(key: str) -> str:
    logger.info(f"Secret accessed: {key} by {get_current_user()}")
    return os.getenv(key)
```

---

## Emergency Response

### 🚨 If Secrets Are Exposed

**Immediate Actions (within 1 hour):**

1. **Revoke compromised credentials:**
   ```bash
   # Database
   psql -c "ALTER USER postgres WITH PASSWORD 'new_secure_password';"
   
   # API Keys
   # → Go to provider dashboard and revoke
   
   # JWT tokens
   # → Invalidate all active sessions
   ```

2. **Update `.env` files:**
   ```bash
   # Generate new secrets
   python -c "import secrets; print(secrets.token_hex(32))" > new_secret.txt
   
   # Update all environments
   vim .env  # Update SECRET_KEY
   vim backend/.env  # Update DB_PASSWORD
   ```

3. **Notify affected parties:**
   - Team members
   - Security team
   - Users (if data breach)

4. **Document the incident:**
   ```markdown
   # Security Incident Report
   Date: 2025-12-03
   Type: Secret exposure
   Affected: JWT SECRET_KEY, DB credentials
   Actions taken:
   - Rotated all secrets
   - Invalidated sessions
   - Updated production environment
   ```

**Follow-up Actions (within 24 hours):**

1. Review Git history for other exposures
2. Implement additional monitoring
3. Update security training
4. Consider moving to secret management service

---

## Checklist for New Developers

Before starting development:

- [ ] Copy `.env.example` to `.env` in root directory
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] Generate secure `SECRET_KEY` using provided command
- [ ] Get MapTiler API key from https://www.maptiler.com
- [ ] Set PostgreSQL password in `backend/.env`
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Run `git status` to confirm `.env` files are ignored
- [ ] Never use production secrets in development
- [ ] Set file permissions: `chmod 600 .env backend/.env`

Before committing code:

- [ ] Review changes with `git diff`
- [ ] Check for hardcoded secrets or credentials
- [ ] Verify no `.env` files in commit
- [ ] Use `.env.example` for configuration examples
- [ ] Remove debug logging that prints sensitive data

---

## Verification Commands

**Check if secrets are protected:**
```bash
# Should return nothing (files are ignored)
git ls-files | grep -E '\\.env$'

# Should show .env files in ignored section
git status --ignored | grep .env

# Verify .gitignore is working
echo "test secret" > .env
git status  # Should NOT show .env as untracked

# Check file permissions (should be -rw-------)
ls -la .env backend/.env
```

**Scan for accidentally committed secrets:**
```bash
# Using gitleaks (install first: brew install gitleaks)
gitleaks detect --source . --verbose

# Using truffleHog
trufflehog filesystem . --only-verified
```

---

## Additional Resources

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App - Config](https://12factor.net/config)
- [GitHub - Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [NIST Guidelines for Password Management](https://pages.nist.gov/800-63-3/sp800-63b.html)

---

## Support

If you discover a security vulnerability:

1. **DO NOT** open a public issue
2. Email security team privately
3. Use encrypted communication if possible
4. Provide details: what was exposed, when, how

**Security Contact:** security@sankat.com (update with real email)

---

**Last Updated:** 2025-12-03  
**Version:** 1.0.0
