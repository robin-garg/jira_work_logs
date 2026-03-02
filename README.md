# Node.js Backend Service with TypeScript

A clean, production-ready Node.js backend service built with TypeScript and Express.

## 🚀 Tech Stack

- **Node.js** with **TypeScript**
- **Express** - Web framework
- **Axios** - HTTP client
- **dotenv** - Environment variable management
- **ts-node-dev** - Development server with auto-reload

## 📁 Project Structure

```
src/
  ├── server.ts       # Main application entry point
  ├── routes/         # API route definitions
  ├── controllers/    # Request handlers
  ├── services/       # Business logic
  ├── config/         # Configuration files
  └── utils/          # Utility functions
```

## 🛠️ Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables:**
   Edit `.env` and set your configuration values.

## 📜 Available Scripts

- **`npm run dev`** - Start development server with auto-reload
- **`npm run build`** - Compile TypeScript to JavaScript
- **`npm start`** - Run production server

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

## 🔍 Health Check

Once the server is running, you can verify it's working:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-02-16T...",
  "uptime": 1.234
}
```

## 🌐 Environment Variables

| Variable | Description | Default | Validation |
|----------|-------------|---------|------------|
| `PORT` | Server port | `3000` | - |
| `JIRA_BASE_URL` | Jira instance URL | **Required** | Must be valid HTTP/HTTPS URL |
| `JIRA_EMAIL` | Jira account email | **Required** | Must be valid email format |
| `JIRA_API_TOKEN` | Jira API token | **Required** | Must not be empty |

### ✅ URL Validation

The `JIRA_BASE_URL` is validated to ensure it's a proper URL:

**Valid examples:**
- ✅ `https://your-domain.atlassian.net`
- ✅ `https://jira.company.com`
- ✅ `http://localhost:8080` (for local testing)

**Invalid examples:**
- ❌ `abc` - Not a valid URL
- ❌ `your-domain.atlassian.net` - Missing protocol (https://)
- ❌ `ftp://jira.company.com` - Wrong protocol (must be http/https)

### ✅ Email Validation

The `JIRA_EMAIL` is validated to ensure it's a proper email address (required by Jira Cloud API):

**Valid examples:**
- ✅ `user@example.com`
- ✅ `john.doe@company.com`
- ✅ `admin@atlassian.net`

**Invalid examples:**
- ❌ `notanemail` - Not a valid email format
- ❌ `userexample.com` - Missing @ symbol
- ❌ `user@` - Missing domain

If validation fails, the app will crash at startup with a clear error message.

## 🧪 Testing Validation

A comprehensive test file (`.env.test`) is provided with 8 different validation scenarios:

```bash
# Copy the test file
cp .env.test .env

# Edit .env and uncomment ONE scenario at a time
# Run the app to see validation in action
npm run dev
```

See `VALIDATION_EXAMPLES.md` for detailed testing instructions and examples.

## 🛠️ Utilities

### Date Utility (`src/utils/date.util.ts`)

Provides date formatting for Jira API integration.

#### `formatWorklogDate(optionalDate?: string): string`

Formats dates to Jira-compatible worklog format: `YYYY-MM-DDTHH:mm:ss.SSS+0000`

**Usage:**

```typescript
import { formatWorklogDate } from './utils/date.util';

// Use current date
const now = formatWorklogDate();
// "2026-03-02T14:30:45.123+0000"

// Use specific date
const specific = formatWorklogDate('2026-01-15');
// "2026-01-15T00:00:00.000+0000"

// Use ISO date string
const iso = formatWorklogDate('2026-01-15T10:30:00Z');
// "2026-01-15T10:30:00.000+0000"
```

**Features:**
- ✅ No external dependencies (uses native Date)
- ✅ Validates date input
- ✅ UTC timezone (+0000)
- ✅ Proper milliseconds padding (3 digits)
- ✅ Throws clear errors for invalid dates

## 📝 Next Steps

The project structure is ready for you to add:
- API routes in `src/routes/`
- Controllers in `src/controllers/`
- Business logic in `src/services/`
- Configuration in `src/config/`
- Utility functions in `src/utils/`

