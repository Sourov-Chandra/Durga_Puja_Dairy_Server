# Durga_Puja_Dairy_Server

**Global Durga Puja Discovery & Mandap Management Platform (Backend REST API)**  
Built with Node.js (ES Modules, Pure JavaScript), Express.js, MongoDB (GeoJSON 2dsphere), and Better Auth / JWT.

---

## 🪔 Features
- **Mandap Centric Architecture:** Schedules, events, announcements, and media linked to mandap records.
- **Worldwide Geolocation & Timezones:** GeoJSON coordinates with IANA timezone calculations for ritual timing.
- **4-Layer Duplicate Detection:** Geospatial proximity checking (50–100m) + string similarity scoring.
- **Multi-Tier RBAC & Resource Authorization:** Fine-grained permissions for ADMIN, MANAGER, STAFF, and USER.
- **Community Submissions & Claims:** Organizer verification workflows and duplicate checks.
- **Audit Logs:** Immutable activity history for platform transparency.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```


### 2. Configure Environment Variables

### 3. Seed Sample Database (Optional)
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```

The API will be available at [http://localhost:5000/api](http://localhost:5000/api).
