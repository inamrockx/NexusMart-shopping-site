---
title: NexusMart E-Commerce Platform
emoji: 🛒
colorFrom: indigo
colorTo: purple
sdk: docker
app_port: 7860
pinned: false
---

# 🛒 NexusMart E-Commerce Platform

NexusMart is an exceptionally premium, high-fidelity e-commerce platform built from scratch utilizing a modern **MERN (React + Node.js + Express + Custom local JSON-Document DB)** architecture. The system combines an immersive customer storefront with a comprehensive back-office administrative console (Shopify-style control hub).

## 🚀 Running Locally

To run the application locally on your machine, follow these steps:

1. **Install all dependencies** from the root folder:
   ```bash
   npm run install:all
   ```
2. **Start the development servers** concurrently:
   ```bash
   npm run dev
   ```
   * Frontend will launch on [http://localhost:5173/](http://localhost:5173/)
   * Backend API server will run on [http://localhost:5000/](http://localhost:5000/)

## 🏗️ System Architecture

* **Frontend**: React single-page application built with Vite and custom styled using Glassmorphism, smooth animations, Outfits/Inter typography, and real-time localized currency translations.
* **Backend**: Express.js REST API providing secure catalog updates, invoice generation, reviews submitters, and performance analytics.
* **Database**: Custom file-locked JSON Document Database (`db.json`) that mimics MongoDB/Mongoose CRUD operations directly on the filesystem for zero-config out-of-the-box reliability.
