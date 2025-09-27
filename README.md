# Iron Vault - Secure File Storage and Sharing System

Iron Vault is a secure file storage and sharing system built on **Next.js and Tailwind CSS** providing users with a comprehensive solution for secure file management, sharing, and collaboration.

![Iron Vault - Secure File Storage System](./banner.png)

With Iron Vault, users get access to a secure platform for storing, sharing, and managing files with robust security features and an intuitive interface. Whether you need personal file storage or team collaboration tools, Iron Vault provides the security and flexibility you need.

Iron Vault utilizes the powerful features of **Next.js 15** and common features such as server-side rendering (SSR), static site generation (SSG), and seamless API route integration. Combined with the advancements of **React 19** and the robustness of **TypeScript**, Iron Vault is the perfect solution for secure file management.

## Overview

Iron Vault provides essential features for building a secure file storage and sharing system. It's built on:

- Next.js 15.x
- React 19
- TypeScript
- Tailwind CSS V4
- FastAPI (Backend)

## Project Structure

```
ironvault/
├── frontend/           # Next.js frontend application
│   ├── src/
│   │   ├── app/       # Next.js App Router pages
│   │   ├── components/ # Reusable React components
│   │   └── lib/       # Utility functions
│   └── public/        # Static assets
├── backend/           # FastAPI backend application
│   ├── app/           # FastAPI application code
│   ├── models/        # Database models
│   └── utils/         # Backend utilities
├── docs/              # Project documentation
└── scripts/           # Development and deployment scripts
```

## Installation

### Prerequisites
To get started with Iron Vault, ensure you have the following prerequisites installed and set up:

- Node.js 18.x or later (recommended to use Node.js 20.x or later)
- Python 3.8+ (for FastAPI backend)
- Git

### Frontend Setup

1. Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2. Install dependencies:
    ```bash
    npm install --legacy-peer-deps
    ```

3. Start the development server:
    ```bash
    npm run dev
    ```

### Backend Setup

1. Navigate to the backend directory:
    ```bash
    cd backend
    ```

2. Create a virtual environment:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Start the development server:
    ```bash
    uvicorn app.main:app --reload
    ```

## Key Features

- **Secure File Storage**: Encrypted file storage with user authentication
- **File Sharing**: Secure file sharing with customizable permissions
- **User Management**: Role-based access control and user profiles
- **Dashboard**: Intuitive dashboard for file management and analytics
- **Search & Filter**: Advanced search and filtering capabilities
- **Dark Mode**: Built-in theme switching for comfortable usage
- **Responsive Design**: Mobile-friendly interface that works on all devices

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router and Server Components
- **React 19**: Modern React with enhanced features
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS v4**: Utility-first CSS framework
- **ApexCharts**: Data visualization and analytics

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping
- **PostgreSQL**: Robust relational database
- **Pydantic**: Data validation using Python type annotations
- **JWT**: JSON Web Token authentication

## License

Iron Vault is released under the MIT License.