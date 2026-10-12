\# Faculty Consultation Booking System



An academic scheduling portal developed for Camarines Sur Polytechnic Colleges (CSPC) to streamline office consultation hours, student booking intake, and official consultation record verification.



\---



\## 👥 Development Team \& Feature Ownership



| Contributor | Role \& Assigned Feature | Status |

| :--- | :--- | :---: |

| \*\*Cris Ivan M. Nual\*\* | Core Architecture, DB Schema (`mysql2` pool), RBAC Session Auth | Completed |

| \*\*Jasmine Baldoza\*\* | Faculty Directory Catalog, Real-time Live Search Engine | Completed |

| \*\*April Peñones\*\* | Consultation Records Ledger, Printable Attendance Slip (`@media print`) | Completed |

| \*\*Kyle Martirez\*\* | Analytics Dashboard KPIs, Faculty Review \& Notes Workflow | Completed |



\---



\## 🛠️ Technology Stack



\- \*\*Runtime \& Backend Framework:\*\* Node.js, Express.js

\- \*\*Database:\*\* MySQL 8.x (Connection Pooling via `mysql2`)

\- \*\*Template Engine:\*\* EJS (Embedded JavaScript)

\- \*\*Styling \& Icons:\*\* Bootstrap 5.3, Bootstrap Icons

\- \*\*Security:\*\* `bcryptjs` password hashing, `express-session` state management

\- \*\*Version Control \& Management:\*\* Git (Feature Branch Workflow), GitHub Projects / Kanban



\---



\## 🚀 Setup \& Local Installation



\### Prerequisites

1\. \*\*Node.js\*\* (v18.x or later installed)

2\. \*\*XAMPP\*\* (Apache \& MySQL services running)



\### 1. Database Configuration

1\. Open \*\*phpMyAdmin\*\* (`http://localhost/phpmyadmin`).

2\. Create a database named `faculty\_consultation\_db` or execute `database/schema.sql`.



\### 2. Environment Configuration

Verify your `.env` file in the project root:

```env

PORT=3000

DB\_HOST=localhost

DB\_USER=root

DB\_PASSWORD=

DB\_NAME=faculty\_consultation\_db

SESSION\_SECRET=faculty\_consultation\_secret\_2026

