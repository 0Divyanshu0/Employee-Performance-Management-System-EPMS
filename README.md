# ⭐ Employee Performance Management System (EPMS)

<p align="center">
  <img src="public/epms_demo.gif" width="1000" />
</p>

---

## 📌 Overview

The **Employee Performance Management System (EPMS)** is a full-stack web application designed to streamline and standardize employee performance evaluation within organizations.

It provides a **structured, transparent, and data-driven approach** to managing employee performance through role-based dashboards, goal tracking, and multi-level review workflows. The system empowers employees, managers, and HR teams to make informed decisions and improve overall organizational productivity.

---

## 🚀 Key Features

### 🔐 Role-Based Access Control (RBAC)
- Employee  
- Manager  
- HR Admin  
- System Admin  

### 📝 Performance Management
- Employee self-assessment submission  
- Manager feedback and performance ratings  
- Multi-level performance review workflow  

### 🎯 Goal Management
- SMART goal setting  
- Progress tracking  

### 📊 Analytics & Visualization
- Interactive dashboards using Chart.js  
- Performance insights and trends  

### 🌐 Authentication & Security
- OAuth 2.0 (Google Login)  
- JWT-based authentication and authorization  

### 💾 Data Management
- MySQL database for persistent storage  

### 📥 Reporting *(Upcoming)*
- Exportable reports (PDF/Excel)  

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- HTML5, CSS3, JavaScript  
- Chart.js  
- React Router  

### Backend
- Node.js  
- Express.js  
- JWT  

### Database
- MySQL  

### Authentication
- OAuth 2.0 (Google Login)  

---

## 🧩 System Architecture

```
Client (React)
   ↓
REST API (Node.js + Express)
   ↓
Authentication (JWT + OAuth 2.0)
   ↓
Database (MySQL)
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/epms.git
cd epms
```

### 2. Install Dependencies

#### Frontend
```bash
cd client
npm install
```

#### Backend
```bash
cd ../server
npm install
```

### 3. Environment Variables

Create a `.env` file in the server folder:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=epms
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
```

---

## ▶️ Running the Application

### Start Backend
```bash
cd server
npm start
```

### Start Frontend
```bash
cd client
npm start
```

---

## 📸 Screenshots

_Add screenshots of your application here (Dashboard, Login, Reports, etc.)_

---

## 📈 Future Enhancements

- Exportable reports  
- Predictive analytics  
- Email notifications  
- Mobile responsiveness  
- HRMS integration  

---

## 🤝 Contribution

Contributions are welcome!

1. Fork the repository  
2. Create a new branch  
3. Commit changes  
4. Submit a pull request  

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙌 Acknowledgements

- Inspired by real-world performance management systems  
- Built as part of full-stack and analytics learning  

---

## 💡 Author

**Your Name**  
GitHub: https://github.com/your-username  
LinkedIn: https://linkedin.com/in/your-profile  

---

⭐ If you like this project, give it a star!
