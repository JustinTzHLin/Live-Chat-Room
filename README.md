# Just In Chat

***Your Secure and Private Live Chat Space***

## 📖 Table of Contents

1. [About Just In Chat](#-about-just-in-chat)
2. [Getting Started](#-getting-started)
3. [Technologies Used](#-technologies-used)
   - [Frontend](#frontend)
   - [Backend](#backend)
   - [Real-time Communication](#real-time-communication)
4. [Local Deployment](#-local-deployment)
5. [License](#-license)

## 💬 About Just In Chat

**Just In Chat** is a modern, secure, and privacy-focused messaging platform designed for real-time communication. We prioritizes user privacy with end-to-end encryption and a commitment to minimal data collection.  It offers a fast, intuitive, and secure chat experience, perfect for individuals, teams, or communities who value their privacy.

## 🚀 Getting Started

Start chatting instantly!
1. Visit the live demo: 👉 [link](https://just-in-chat.vercel.app/)
2. Create an account or log in.
3. Start chatting!

## 🛠 Technologies Used

**Just In Chat** is built with the following technologies:

### Frontend:
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://www.javascript.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)](https://html.com/html5/)
[![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Next.js](https://img.shields.io/badge/next%20js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000?style=for-the-badge&logo=shadcnui&logoColor=fff)](https://ui.shadcn.com/)

### Backend:
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)](https://jwt.io/)

### Real-time Communication:
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=Socket.io&logoColor=white)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-333333?style=for-the-badge&logo=WebRTC&logoColor=white)](https://webrtc.org/)

## 💻 Local Deployment

To run **Just In Chat** locally, follow the steps below:

1. **Clone the repository**:
```bash
   git clone https://github.com/JustinTzHLin/Live-Chat-Room.git
   cd Live-Chat-Room
```

2. **Set up the Frontend:**
- Navigate to the `frontend` directory and install dependencies:
```bash
   cd frontend
   npm install
```
- Create a `.env.local` file in the `frontend` directory and configure the required environment variables.  
   For reference, you can check the following examples:
   - [Frontend Environment Variables](frontend/.env.example)
- For **development** mode, run:
```bash
   npm run dev
```  
&emsp;&emsp;This will start the frontend on http://localhost:3000.
- For **production** mode, run:
```bash
   npm run build
   npm start
```
&emsp;&emsp;This will start the production build of the frontend.

3. **Set up the Backend:**
- Navigate to the `backend` directory and install dependencies:
```bash
   cd ../backend
   npm install
```
- Create a `.env.local` file in the `backend` directory and configure the required environment variables.  
   For reference, you can check the following examples:
   - [Backend Environment Variables](backend/.env.example)
- For **development** mode, run:
```bash
   npm run dev
```
&emsp;&emsp;This will start the backend on http://localhost:8000.
- For **production** mode, run:
```bash
   npm start
```
&emsp;&emsp;This will start the backend in production mode.

4. **Connecting Frontend and Backend**
- Ensure the backend is running before starting the frontend.
- Make sure the correct URLs are configured in the `.env.local` files for both the frontend and backend.

&emsp;Once both parts are running, you can access the application by visiting http://localhost:3000.

## 📜 License

**Just In Chat** is licensed under the **MIT License**, which allows you to use, modify, and distribute it without restrictions freely.
