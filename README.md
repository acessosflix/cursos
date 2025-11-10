# Personal Finance Management Web Application

A complete full-stack personal finance management application built with React (frontend) and Node.js + Express (backend), using MongoDB for data storage.

## Features

### Core Features
- **Dashboard**: Overview of income, expenses, savings, and balance with interactive charts
- **Transactions**: Add, edit, delete, and filter transactions (Income/Expense)
- **Budgets**: Set monthly or category-based budgets with visual alerts
- **Savings Goals**: Set and track savings targets with progress visualization
- **Reports & Analytics**: Generate monthly/annual reports with CSV/PDF export
- **Authentication**: JWT-based authentication with role-based access (Admin/User)
- **Dark/Light Mode**: Toggle between themes
- **Multi-language**: Support for English and Portuguese

### Bonus Features
- Recurring transactions (daily, weekly, monthly, yearly)
- Budget alerts when approaching or exceeding limits
- Goal progress tracking based on income minus expenses
- Interactive charts using Recharts
- Responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Recharts (for charts)
- React Router DOM
- Axios
- React Toastify
- React Icons

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs (password hashing)
- express-validator (input validation)
- PDFKit (PDF generation)
- csv-writer (CSV export)

## Project Structure

```
personal-finance-management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Auth, Theme, Language)
│   │   ├── pages/         # Page components
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                 # Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── scripts/           # Seed data script
│   └── server.js          # Express server entry point
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd personal-finance-management
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```
   Or install separately:
   ```bash
   npm install
   cd server && npm install
   cd ../client && npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `server` directory:
   ```bash
   cd server
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/personal-finance
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

   For MongoDB Atlas, use:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/personal-finance
   ```

4. **Seed the database (optional)**
   ```bash
   cd server
   npm run seed
   ```

   This creates test users:
   - Admin: `admin@test.com` / `password123`
   - User: `user@test.com` / `password123`

5. **Start the development servers**

   From the root directory:
   ```bash
   npm run dev
   ```

   Or start separately:
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Update password

### Transactions
- `GET /api/transactions` - Get all transactions (with filters)
- `GET /api/transactions/:id` - Get single transaction
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/stats/summary` - Get transaction summary

### Budgets
- `GET /api/budgets` - Get all budgets
- `GET /api/budgets/:id` - Get single budget
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Goals
- `GET /api/goals` - Get all goals
- `GET /api/goals/:id` - Get single goal
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Reports
- `GET /api/reports/summary` - Get financial summary
- `GET /api/reports/export/csv` - Export transactions as CSV
- `GET /api/reports/export/pdf` - Export report as PDF

## Usage

1. **Register/Login**: Create an account or use the seeded test accounts
2. **Add Transactions**: Track your income and expenses
3. **Set Budgets**: Create budgets for different categories
4. **Create Goals**: Set savings goals and track progress
5. **View Reports**: Generate reports and export data
6. **Toggle Theme**: Switch between dark and light mode
7. **Change Language**: Switch between English and Portuguese

## Deployment

### Backend (Render/Heroku)
1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas connection string is set
3. Deploy the `server` directory

### Frontend (Vercel/Netlify)
1. Build the frontend: `cd client && npm run build`
2. Deploy the `dist` folder
3. Set API proxy or environment variables for API URL

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Input validation with express-validator
- Protected routes with authentication middleware
- Role-based access control (Admin/User)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
