# MediTriage - AI Integrated Dental & Medical Triage System

## Project Overview
- **Project Name**: MediTriage
- **Type**: Full-stack Web Application (React + Node.js)
- **Core Functionality**: AI-powered medical and dental triage system with symptom checking, doctor appointment booking, and emergency services integration
- **Target Users**: Patients, Doctors, Ambulance Drivers, Hospitals

---

## UI/UX Specification

### Color Palette
- **Primary**: `#0D9488` (Teal - medical trust)
- **Primary Dark**: `#0F766E`
- **Primary Light**: `#14B8A6`
- **Secondary**: `#1E293B` (Dark slate)
- **Accent Emergency**: `#DC2626` (Red - emergencies)
- **Accent Urgent**: `#F59E0B` (Amber - urgent)
- **Accent Normal**: `#10B981` (Emerald - normal)
- **Background**: `#F8FAFC`
- **Surface**: `#FFFFFF`
- **Text Primary**: `#1E293B`
- **Text Secondary**: `#64748B`
- **Border**: `#E2E8F0`

### Typography
- **Font Family**: `'Inter', 'Segoe UI', system-ui, sans-serif`
- **Headings**: 
  - H1: 2.5rem, font-weight 700
  - H2: 2rem, font-weight 600
  - H3: 1.5rem, font-weight 600
  - H4: 1.25rem, font-weight 500
- **Body**: 1rem, font-weight 400
- **Small**: 0.875rem

### Spacing System
- Base unit: 4px
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## Page Structure

### 1. Landing Page
- Hero section with app introduction
- Features overview (4 cards)
- User type selection buttons
- Emergency banner at top (always visible)

### 2. Sign Up Page
**Patient Registration:**
- Full Name, Email, Phone, Date of Birth, Gender
- Address (Street, City, State, Pincode)
- Blood Type, Allergies (text)
- Medical History (textarea or file upload for reports)
- Emergency Contact Name & Phone
- Password, Confirm Password

**Doctor Registration:**
- Full Name, Email, Phone
- Specialization (dropdown: General, Cardiology, Neurology, Orthopedics, Dental, Pediatrics, Dermatology, Emergency Medicine)
- Registration Number, Years of Experience
- Hospital/Clinic Name & Address
- Consultation Fee, Availability Schedule
- Password, Confirm Password

**Ambulance Driver Registration:**
- Full Name, Email, Phone
- Date of Birth, License Number, License Expiry
- Vehicle Type (Ambulance, Medical Van)
- Vehicle Number, Vehicle Model
- Operating City/Region
- Password, Confirm Password

### 3. Sign In Page
- Email/Username field
- Password field
- OR divider
- "Sign in with Phone" tab
- Phone number input + OTP request button
- OTP input field (6 digits)
- Remember me checkbox
- Forgot password link

### 4. Dashboard (Role-based)

**Patient Dashboard:**
- Welcome message with name
- Quick Actions: Check Symptoms, Book Appointment, Emergency
- Recent medical history summary
- Upcoming appointments
- Health tips

**Doctor Dashboard:**
- Today's appointments list
- Patient queue
- Quick patient lookup
- Earnings summary

**Ambulance Driver Dashboard:**
- Current assignment (if any)
- Available requests
- Earnings today

### 5. Symptom Checker Page
- Search input for symptoms
- Body map clickable (optional)
- Selected symptoms list
- "Analyze Symptoms" button
- Results section:
  - Triage Level Badge (Emergency/Urgent/Normal)
  - List of possible conditions with probability %
  - Recommendations for each condition
  - "Book Appointment" button
  - "Emergency Contact" button (if emergency)

### 6. Doctor Appointment Booking Page
- Search/filter by:
  - Specialty
  - Doctor name
  - Date
  - Availability
- Doctor cards showing:
  - Name, Photo, Specialization
  - Rating, Experience
  - Availability status (Available/Busy/Offline)
  - Consultation fee
- Selected doctor details:
  - Available time slots
  - Book button
- Confirmation modal

### 7. Emergency Page
- Large "CALL EMERGENCY" button
- Current location display (with map)
- Nearby hospitals list
- "Notify Ambulance" button
- Patient status form (brief)
- Medical history summary to send
- Live ambulance tracking (if dispatched)

### 8. Hospital Management Page (for admins)
- Register hospital
- Manage bed availability
- View emergency requests

---

## Functionality Specification

### Authentication
- JWT-based authentication
- Role-based access control (Patient, Doctor, Driver, Admin)
- Password hashing with bcrypt
- OTP generation (6-digit numeric)
- Session persistence with localStorage

### Symptom Checker AI Logic
- Database of 50+ conditions with symptoms
- Matching algorithm calculates probability
- Triage classification:
  - **Emergency**: Life-threatening symptoms (chest pain, difficulty breathing, severe bleeding, unconscious)
  - **Urgent**: Serious but stable (high fever, moderate pain, dizziness)
  - **Normal**: Non-critical (mild symptoms, follow-up, prescriptions)
- Multi-condition matching for similar symptoms

### Appointment System
- Doctor availability slots (30-min intervals)
- Booking confirmation via email/SMS
- Cancellation/rescheduling
- Appointment reminders
- Waitlist for fully booked doctors

### Emergency System
- Geolocation API for patient location
- Hospital database with contact numbers
- Driver assignment algorithm (nearest available)
- Real-time status updates
- Medical history auto-send to assigned doctor

### Medical History
- Text-based entries
- File upload for reports (PDF, images)
- History timeline view
- Sharing with doctors

---

## Technical Stack

### Frontend
- React 18 with Vite
- React Router v6
- Axios for API calls
- Lucide React icons
- CSS Modules or styled-components

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT for auth
- Multer for file uploads

---

## Acceptance Criteria

1. ✅ All three user types can register with role-specific fields
2. ✅ Sign in works with email/password and phone/OTP
3. ✅ Symptom checker returns multiple possible conditions with triage level
4. ✅ Doctor appointment booking shows real availability
5. ✅ Emergency page shows location and can dispatch ambulance
6. ✅ Medical history is accessible to doctors
7. ✅ Responsive design works on mobile and desktop
8. ✅ No console errors on page load
9. ✅ All forms validate inputs properly
10. ✅ Navigation between pages works smoothly
