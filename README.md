# EduBridge - Final Year Project

EduBridge is an AI-powered academic support platform designed to assist university students with personalised, adaptive, and interactive learning. The system aims to bridge gaps in understanding, promote independent learning, and provide accessible academic support through intelligent tutoring features.

---

## 📌 Project Overview

EduBridge addresses limitations in existing AI tutoring systems by focusing on:

* Personalised learning experiences
* Clear, adaptive explanations
* Support for independent and self-directed learning
* Ethical and responsible use of AI

The platform leverages AI (including Large Language Models) to simulate tutoring interactions and provide real-time academic assistance.

---

## 🚀 Key Features

* 🧠 **AI Tutoring Chat**

  * Provides explanations, hints, and academic guidance
  * Focuses on understanding rather than giving direct answers

* 📊 **Adaptive Learning**

  * Adjusts explanations based on user input
  * Supports different learning styles

* 🔁 **Explain It Back**

  * Encourages students to explain concepts themselves
  * Promotes active learning and critical thinking

* 📚 **Multi-Subject Support**

  * Designed for university-level learning

* 🌐 **Accessible Interface**

  * Simple and intuitive UI
  * Designed with inclusivity in mind

---

## 🏗️ System Architecture

EduBridge follows a client-server architecture:

### 🔹 Frontend

* Built using modern web technologies (React + Vite)
* Handles user interaction and UI rendering
* Sends requests to backend APIs

### 🔹 Backend

* Built using Python
* Handles AI logic and data processing
* Manages user data and learning interactions

---

## 🛠️ Technologies Used

### Frontend

* HTML, CSS, JavaScript
* React (Vite)

### Backend

* Python
* Django 

### AI / Data

* Large Language Models (LLMs)
* Adaptive learning logic

### Tools

* Git & GitHub
* PyCharm / VS Code
* Jupyter Notebook

---

## ⚙️ Installation & Setup

Follow these steps to run EduBridge locally.

---

### 📥 1. Clone the Repository

```bash
git clone https://github.com/yourusername/EduBridge-FYP.git
cd EduBridge-FYP
```

---

## 🖥️ Backend Setup (Python)

### Step 1: Navigate to backend

```bash
cd backend
```

---

### Step 2: Create virtual environment

```bash
python -m venv env
```

#### Mac/Linux:

```bash
source env/bin/activate
```

#### Windows:

```bash
env\Scripts\activate
```

---

### Step 3: Install dependencies

```bash
pip install -r requirements.txt
```

---

### Step 4: Run backend server

If using Django:

```bash
python manage.py runserver
```

If using Flask:

```bash
python app.py
```

Backend will run on:

```
http://localhost:8000
```

---

## 🌐 Frontend Setup (React / Vite)

### Step 1: Open a new terminal and navigate to frontend

```bash
cd frontend
```

---

### Step 2: Install dependencies

```bash
npm install
```

---

### Step 3: Run development server

```bash
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

## 🔗 Connecting Frontend & Backend

Ensure the frontend is configured to communicate with the backend API.

Check:

* API base URL (e.g., `http://localhost:8000`)
* `.env` configuration files

---

## ▶️ Running the Full Application

1. Start backend server
2. Start frontend server
3. Open browser:

```
http://localhost:5173
```

---

## 🔐 Ethical Considerations

* User data is handled in accordance with data protection principles (e.g., GDPR)
* Only necessary data is collected and stored
* Users must provide informed consent before testing the system
* AI responses are designed to:

  * Minimise bias
  * Promote understanding
  * Avoid over-reliance

---

## ⚠️ Limitations

* AI responses may occasionally be inaccurate (hallucination risk)
* Requires internet access for full functionality
* Performance depends on model/API availability

---

## 🔮 Future Improvements

* Improved personalisation using learning analytics
* Bias detection and mitigation strategies
* Offline support for low-resource environments
* Expanded academic subject coverage

---

## 📁 Project Structure

```
EduBridge-FYP/
│
├── backend/        # Backend logic (Python)
├── frontend/       # Frontend (React + Vite)
├── README.md
└── .gitignore
```

---

## 👩‍💻 Author

**Maimuna Nowaz**
BSc Computer Science – Final Year Project
Queen Mary University of London

---

## 📜 License

This project is for academic use only.
