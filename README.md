# 🍲 SHERO-NourishNet
> **AI-Driven Surplus Food Waste Prediction & Intelligent Redistribution Platform**

SHERO-NourishNet is an AI-powered platform designed to combat urban food waste and reduce hunger by connecting food donors (restaurants, event organizers, households) with nearby NGOs and volunteers for rapid, efficient surplus food redistribution.

---

## 🌟 Key Features

- **🤖 AI Surplus Food Waste Prediction**: Employs predictive ML heuristics (Random Forest Regressor pipeline) to forecast expected surplus food quantities based on guest counts, event types, and historical data.
- **🔍 AI Food Quality & Safety Assessment**: Automated visual/sensor inspection heuristics to rate freshness and safety before redistribution.
- **⚡ Smart Matching Algorithm**: Matches surplus food listings with nearby NGOs based on distance, quantity needed, urgency, and food preferences.
- **🚚 Real-time Delivery & Logistics Tracking**: Tracks pickup, dispatch, and delivery milestones with assigned volunteer drivers.
- **👥 Multi-Role Interactive Portals**:
  - **Donor Dashboard**: List surplus food, view AI predictions, track donation history.
  - **NGO Dashboard**: Request food, receive matched donations, accept deliveries.
  - **Volunteer Dashboard**: Accept delivery routes, update live order status.
  - **Admin Panel**: Monitor platform metrics, user verification, system logs, and analytical reports.
- **⭐ Feedback & Rating System**: Ensures quality standards and accountability across all parties.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, Modern CSS3, JavaScript (ES6+), Fetch API |
| **Backend** | Python 3.x, Flask (RESTful Blueprints API), CORS, Werkzeug |
| **Database** | MySQL 8.x (Relational Database) |
| **AI / ML** | Python Scikit-Learn (Random Forest Pipeline), Computer Vision heuristics |
| **Tools & OS** | Git, PowerShell, dotenv environment configuration |

---

## 📁 Repository Structure

```text
SHERO-NourishNet/
│
├── Backend/
│   ├── app.py                      # Flask Application Entry Point & Global Handlers
│   ├── config.py                   # Environment & Database Configuration
│   ├── db.py                       # MySQL Connection Manager
│   ├── test_db.py                  # Database Connection Verification Script
│   ├── requirements.txt            # Python Dependencies
│   ├── .env.example                # Sample Environment Variables
│   │
│   ├── database/
│   │   └── schema.sql              # Database Tables & Schema Setup Script
│   │
│   ├── ml/                         # AI / Machine Learning Modules
│   │   ├── prediction.py           # Surplus Food Prediction Model
│   │   └── image_recognition.py    # Food Quality Inspection Heuristics
│   │
│   ├── models/                     # Data Access Models
│   │   ├── user.py
│   │   ├── food.py
│   │   ├── request.py
│   │   ├── delivery.py
│   │   ├── tracking.py
│   │   └── feedback.py
│   │
│   ├── routes/                     # REST API Endpoints (Blueprints)
│   │   ├── auth.py                 # Registration & Login Routes
│   │   ├── food.py                 # Food Donation Listings
│   │   ├── requests.py             # NGO Food Requests
│   │   ├── matching.py             # Intelligent Redistribution Logic
│   │   ├── delivery.py             # Delivery Assignment
│   │   ├── tracking.py             # Real-time Status Tracking
│   │   ├── feedback.py             # Reviews & Ratings
│   │   └── admin.py                # Admin Operations & Analytics
│   │
│   └── services/                   # Business Logic & Middlewares
│       ├── auth_middleware.py
│       ├── matching.py
│       └── safety.py
│
├── FrontEnd/
│   ├── index.html                  # Landing Page & Portal Overview
│   ├── donor.html                  # Donor Management Dashboard
│   ├── ngo.html                    # NGO Request & Receiver Dashboard
│   ├── volunteer.html              # Volunteer Driver Dashboard
│   ├── admin.html                  # System Administration Console
│   ├── css/
│   │   └── style.css               # Main Stylesheet
│   └── js/                         # Frontend Controllers & Config
│       ├── config.js
│       ├── auth.js
│       ├── donor.js
│       ├── ngo.js
│       ├── volunteer.js
│       └── admin.js
│
├── .gitignore                      # Git Exclusions File
└── README.md                       # Project Documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Python**: Version 3.9+
- **MySQL**: MySQL Server 8.0+ running locally or on a remote server
- **Web Browser**: Chrome, Edge, or Firefox

---

### 1. Database Setup

1. Open your MySQL client (e.g., MySQL Workbench, Command Line, or phpMyAdmin).
2. Create a new database:
   ```sql
   CREATE DATABASE IF NOT EXISTS nourishnet;
   ```
3. Run the schema initialization script located at `Backend/database/schema.sql` to generate all required tables.

---

### 2. Backend Setup

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Create and activate a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Copy `.env.example` to `.env` and fill in your database credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=nourishnet
   DB_PORT=3306
   SECRET_KEY=your_super_secret_jwt_key
   PORT=5000
   ```

5. Test the database connection:
   ```bash
   python test_db.py
   ```

6. Launch the Flask API server:
   ```bash
   python app.py
   ```
   The backend server will run at `http://localhost:5000`.

---

### 3. Frontend Setup

1. Open the `FrontEnd` folder.
2. Open `index.html` in any browser, or use Live Server in VS Code.
3. Configure API host URL in `FrontEnd/js/config.js` if running backend on a custom host/port.

---

## 📡 API Endpoint Overview

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **System** | `GET` | `/api/health` | Backend & Database health check |
| **Auth** | `POST` | `/api/auth/register` | Register Donor, NGO, or Volunteer |
| | `POST` | `/api/auth/login` | Authenticate user & get session token |
| **Food Donations** | `POST` | `/api/food/add` | List new surplus food item |
| | `GET` | `/api/food/available` | View active surplus food items |
| | `POST` | `/api/food/predict` | AI surplus quantity prediction |
| **Matching** | `GET` | `/api/matching/find-matches` | Run AI matching for NGOs/Donors |
| **Requests** | `POST` | `/api/requests/create` | Submit food request from NGO |
| **Delivery & Tracking** | `POST` | `/api/delivery/assign` | Assign volunteer to delivery route |
| | `GET` | `/api/tracking/<delivery_id>` | Track live status of delivery |
| **Feedback** | `POST` | `/api/feedback/submit` | Submit quality/delivery review |
| **Admin** | `GET` | `/api/admin/analytics` | View system analytics & total food saved |

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
