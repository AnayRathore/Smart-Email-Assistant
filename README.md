# 📧 Smart Email Assistant

AI-powered email reply generator – a full-stack application with Chrome extension and Java Spring Boot backend.

---

##  Features

-  **Browser-integrated** Chrome extension for Gmail that injects "Generate AI Reply" in compose windows  
-  **Email summarization & reply suggestion** using Gemini or custom LLM  
-  **Tone customization**: ‘Professional’, ‘Friendly’, ‘Casual’, etc.  
-  **Secure** communication between frontend and backend  
-  **Copy to clipboard**, loading indicator, and intuitive UI built with React + MUI  
-  Backend implemented using **Java Spring Boot REST API** (ready to serve model calls)

---

##  Tech Stack

| Layer           | Tech Stack                       |
|------------------|----------------------------------|
| **Backend**      | Java Spring Boot (REST API)      |
| **Frontend**     | React + Material-UI (MUI)        |
| **Browser**      | Chrome Extension (content.js)    |
| **AI Integration** | Gemini API or locally hosted model |
| **Build Tools**  | Maven / NPM                      |

---

## Project Workflow

1. User composes an email on Gmail → extension injects button after DOM detects compose window  
2. On click, React frontend collects email content and selected tone  
3. Axios POSTs to backend: `/api/email/generate`  
4. Backend calls AI model (Gemini or local), returns generated reply  
5. Frontend displays reply in UI with copy functionality

---

## ⚙️ Setup & Install

### 🔧 Backend (Java Spring Boot)

```bash
cd backend/
mvn clean install
mvn spring-boot:run
