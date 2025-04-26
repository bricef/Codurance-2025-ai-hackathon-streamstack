# Codurance-2025-ai-hackathon-streamstack
Starter repository for the film and tv challenge based on a fictitious startup as part of the Codurance AI Hackathon

# StreamStack

A community-driven platform for reviewing and rating Netflix shows and films.

## Features

- Browse Netflix titles with detailed information
- Filter titles by director and rating
- Sort titles by release year or title
- Search titles by name or keyword
- View detailed information about each title
- Leave ratings and written reviews
- View average ratings and all reviews for each title

## Tech Stack

- Frontend: React with Material-UI
- Backend: Node.js with Express
- Database: SQLite

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/streamstack.git
cd streamstack
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

## Running the Application

1. Start the backend server:
```bash
# From the root directory
npm run dev
```

2. Start the frontend development server:
```bash
# From the client directory
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## API Endpoints

### Titles
- `GET /api/titles` - Get all titles
- `GET /api/titles/:id` - Get title details by ID

### Reviews
- `GET /api/reviews/:show_id` - Get reviews for a title
- `GET /api/reviews/:show_id/average` - Get average rating for a title
- `POST /api/reviews` - Add a new review

## Development

The project structure is organized as follows:

```
streamstack/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── App.js        # Main application component
├── server.js              # Express backend server
├── netflix.sqlite         # SQLite database
└── package.json          # Backend dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Context
StreamStack is a new startup aiming to build a **community-driven platform** where users can review and rate Netflix shows and films.

They believe that while Netflix offers a vast catalogue of content, it lacks a **social layer** for discussion, recommendations, and authentic viewer feedback.

The first version of the platform will be a **simple web application** allowing users to:
- Browse Netflix titles
- View detailed information
- Leave ratings and written reviews

StreamStack is open to using any technology or framework (React, Vue, Angular, Django, Flask, Spring Boot, etc.).  
The only restriction: **no low-code or no-code tools** are allowed.

The **UI/UX is completely up to you**.  
They encourage creativity and want an intuitive, visually engaging interface that would appeal to TV and film enthusiasts.

To get started, StreamStack recommends using this open-source Netflix titles dataset from Kaggle:  
🔗 [Netflix Shows Dataset](https://www.kaggle.com/datasets/shivamb/netflix-shows/data)

---

## Required Features

### 🎬 Title Catalogue Page
- Display a list of Netflix titles (films and series) with metadata such as **title**, **type**, and **release year**.
- Users should be able to **filter** by director and rating.
- Users should be able to **sort** by release year or title.

### 🔍 Title Detail Page
- Navigate to a detailed page when a title is clicked.
- Show **description**, **cast**, and additional metadata.
- Include a **reviews and ratings section**.

### ✍️ Add a Review
- Allow users to **submit a rating** (e.g., 1 to 5 stars) and a **written review** for any title.
- Assume **all users are anonymous** — no authentication is required.

### 🛠️ Backend API
- Implement a backend API to:
  - Serve the title data
  - Manage user reviews
- Load the Netflix dataset into a **local database** or **serve from memory**.

### 🎨 Frontend UI
- Build a **responsive, user-friendly** frontend.
- The design and styling are up to you — focus on **clarity and usability**.

### 📈 Review Aggregation
- For each title, **calculate and display the average user rating** based on submitted reviews.

### 🔎 Search Functionality
- Implement a **search bar** that lets users search titles by name or keyword.

---

## Additional Information

- Please **fork** the following GitHub repository: `Codurance-2025-ai-hackathon-streamstack` and commit your solution there.
- There is **no requirement to build a CI/CD pipeline**.
- **Local development** is sufficient — no deployment to an external environment is needed.
- **Code quality is important** to StreamStack.  
  Your solution should be **well-designed** and **written in a test-driven manner**.
