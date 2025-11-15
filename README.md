# Audience Query Management System

A unified system for managing customer queries from multiple channels.

## Features

- ✅ Unified inbox for all queries
- ✅ Auto-categorization by channel (email, social, chat)
- ✅ Priority levels (low, medium, high)
- ✅ Status tracking (open, in progress, closed)
- ✅ Assignment system
- ✅ Real-time dashboard with statistics

## Quick Start

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000 to see the application.

## API Endpoints

- `GET /api/queries` - Get all queries
- `POST /api/queries` - Create new query
- `PUT /api/queries/:id` - Update query status/assignment

## Next Steps

1. Add user authentication
2. Integrate with email/social APIs
3. Add real-time notifications
4. Implement advanced filtering
5. Add analytics and reporting