# HouseKeepin - Household Management System

HouseKeepin is a comprehensive web application designed to simplify household management by providing tools for task management, budgeting, and event coordination. It allows household members to collaborate effectively on daily responsibilities, financial planning, and scheduling.

## 🚀 Technology Stack

HouseKeepin is built with a modern technology stack:

- **Frontend**: 
  - [Next.js 14](https://nextjs.org/) - React framework with server-side rendering
  - [React 18](https://reactjs.org/) - JavaScript library for building user interfaces
  - [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
  - [Material UI](https://mui.com/) - Component library for React
  - [Framer Motion](https://www.framer.com/motion/) - Animation library for React

- **Backend/Database**:
  - [Supabase](https://supabase.com/) - Open source Firebase alternative
  - PostgreSQL - Relational database (managed by Supabase)

- **Authentication**:
  - Supabase Auth - Authentication system with email/password support

- **APIs**:
  - [OpenWeatherMap API](https://openweathermap.org/api) - Weather data integration
  - [Google Maps API](https://developers.google.com/maps) - Location services

- **Form Handling**:
  - [React Hook Form](https://react-hook-form.com/) - Form validation library

- **Data Visualization**:
  - [Recharts](https://recharts.org/) - Charting library for React
  - [React Big Calendar](https://github.com/jquense/react-big-calendar) - Calendar component for event display

## 📱 Features

HouseKeepin offers several key features to help manage your household effectively:

### 🏠 Household Management
- Create and manage household profiles
- Invite members to join your household
- Assign roles to household members

### ✅ Task Management
- Create tasks with titles, descriptions, and due dates
- Assign tasks to household members
- Mark tasks as completed
- Archive completed tasks for history tracking

### 📅 Calendar & Event Planning
- Schedule one-time and recurring events
- View all household events in a calendar view
- Get reminders for upcoming events
- Specify event location with map integration

### 💰 Budget Management
- Create budgets with start/end dates and total amounts
- Categorize expenses
- Track transactions (income & expenses)
- Visualize spending patterns

## 🗃️ Database Schema

The application uses a PostgreSQL database (via Supabase) with the following main tables:
- `households` - Stores household information
- `household_members` - Manages household membership
- `tasks` - Tracks household tasks and assignments
- `archived_tasks` - Stores completed and archived tasks
- `calendar_events` & `recurring_events` - Manages event scheduling
- `budgets`, `budget_categories`, & `transactions` - Handles financial tracking
- `users` - Stores user profiles
- `invitations` - Manages pending household invitations

## 💻 Installation and Setup

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Git

### Environment Variables
Create a `.env.local` file in the root directory with the following variables:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OPENWEATHERMAP_API_KEY=your_openweathermap_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Installation Steps

1. Clone the repository
```bash
git clone https://github.com/your-username/housekeepin-next.git
cd housekeepin-next
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application

### Building for Production

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 🔒 Authentication

The application uses Supabase Authentication. Users can:
- Register with email and password
- Sign in with existing credentials
- Reset passwords if forgotten
- Access protected routes only when authenticated

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.