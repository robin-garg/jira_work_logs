# Jira Configuration Validation Examples

This document shows how the validation works for Jira configuration with different inputs.

## ✅ Valid URLs

These URLs will pass validation:

```bash
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_BASE_URL=https://jira.company.com
JIRA_BASE_URL=https://jira.company.com:8080
JIRA_BASE_URL=http://localhost:8080
JIRA_BASE_URL=http://192.168.1.100:8080
```

## ❌ Invalid URLs

### Example 1: Plain text (not a URL)
```bash
JIRA_BASE_URL=abc
```
**Error:**
```
Invalid JIRA_BASE_URL: Not a valid URL format.
Expected format: https://your-domain.atlassian.net
Received: abc
```

### Example 2: Missing protocol
```bash
JIRA_BASE_URL=your-domain.atlassian.net
```
**Error:**
```
Invalid JIRA_BASE_URL: Not a valid URL format.
Expected format: https://your-domain.atlassian.net
Received: your-domain.atlassian.net
```

### Example 3: Wrong protocol
```bash
JIRA_BASE_URL=ftp://jira.company.com
```
**Error:**
```
Invalid JIRA_BASE_URL: URL must use http:// or https:// protocol.
Received: ftp://jira.company.com
```

### Example 4: Empty value
```bash
JIRA_BASE_URL=
```
**Error:**
```
Missing required environment variable: JIRA_BASE_URL
Please set JIRA_BASE_URL in your .env file or environment.
```

## 🧪 Testing Validation

We provide a comprehensive test file (`.env.test`) with multiple validation scenarios.

### Quick Test

1. **Copy the test file:**
   ```bash
   cp .env.test .env
   ```

2. **Edit `.env` and uncomment ONE scenario at a time:**
   - Scenario 1: ✅ Valid configuration (default)
   - Scenario 2: ❌ Invalid URL - plain text (`abc`)
   - Scenario 3: ❌ Invalid URL - missing protocol
   - Scenario 4: ❌ Invalid URL - wrong protocol (`ftp://`)
   - Scenario 5: ❌ Invalid email - plain text (`notanemail`)
   - Scenario 6: ❌ Invalid email - missing @ symbol
   - Scenario 7: ❌ Invalid email - missing domain
   - Scenario 8: ❌ Missing required variable

3. **Run the app:**
   ```bash
   npm run dev
   ```

4. **Observe the result:**
   - ✅ Valid scenarios: App starts successfully
   - ❌ Invalid scenarios: App crashes with clear error message

### Example: Testing Invalid Email

Edit `.env` and uncomment Scenario 5:
```bash
# Comment out Scenario 1
# JIRA_BASE_URL=https://test-domain.atlassian.net
# JIRA_EMAIL=test@example.com
# JIRA_API_TOKEN=test-token-123

# Uncomment Scenario 5
JIRA_BASE_URL=https://test-domain.atlassian.net
JIRA_EMAIL=notanemail
JIRA_API_TOKEN=test-token-123
```

Run `npm run dev` and you'll see:
```
Error: Invalid JIRA_EMAIL: Must be a valid email address.
Jira Cloud API requires your Atlassian account email for authentication.
Expected format: user@example.com
Received: notanemail
```

---

# JIRA_EMAIL Validation Examples

This section shows how the email validation works with different inputs.

## ✅ Valid Emails

These emails will pass validation:

```bash
JIRA_EMAIL=user@example.com
JIRA_EMAIL=john.doe@company.com
JIRA_EMAIL=admin@atlassian.net
JIRA_EMAIL=test.user+tag@domain.co.uk
```

## ❌ Invalid Emails

### Example 1: Plain text (not an email)
```bash
JIRA_EMAIL=notanemail
```
**Error:**
```
Invalid JIRA_EMAIL: Must be a valid email address.
Jira Cloud API requires your Atlassian account email for authentication.
Expected format: user@example.com
Received: notanemail
```

### Example 2: Missing @ symbol
```bash
JIRA_EMAIL=userexample.com
```
**Error:**
```
Invalid JIRA_EMAIL: Must be a valid email address.
Jira Cloud API requires your Atlassian account email for authentication.
Expected format: user@example.com
Received: userexample.com
```

### Example 3: Missing domain
```bash
JIRA_EMAIL=user@
```
**Error:**
```
Invalid JIRA_EMAIL: Must be a valid email address.
Jira Cloud API requires your Atlassian account email for authentication.
Expected format: user@example.com
Received: user@
```

### Example 4: Empty value
```bash
JIRA_EMAIL=
```
**Error:**
```
Missing required environment variable: JIRA_EMAIL
Please set JIRA_EMAIL in your .env file or environment.
```

---

## 🔍 How It Works

### URL Validation

The validation uses Node.js's built-in `URL` class to parse and validate the URL:

1. **Parse the URL** - Ensures it's a valid URL format
2. **Check protocol** - Must be `http:` or `https:`
3. **Check hostname** - Must have a valid hostname

This prevents common mistakes like:
- Typos (e.g., "abc" instead of a URL)
- Forgetting the protocol (e.g., "jira.company.com" instead of "https://jira.company.com")
- Using wrong protocols (e.g., "ftp://")

### Email Validation

The validation uses a regex pattern to validate email format:

1. **Check format** - Must match pattern: `something@something.something`
2. **No whitespace** - Email cannot contain spaces
3. **Has @ symbol** - Must have exactly one @ symbol
4. **Has domain** - Must have a domain after @

This prevents common mistakes like:
- Typos (e.g., "notanemail" instead of an email)
- Missing @ symbol (e.g., "userexample.com")
- Incomplete emails (e.g., "user@")

**Note:** Jira Cloud API requires your Atlassian account email address for authentication, not a username.

