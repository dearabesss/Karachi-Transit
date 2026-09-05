Karachi Transit

A web-based public transit planner for Karachi and other major Pakistani cities. The application provides interactive maps, route planning, fare information, GPS-based nearest-stop detection, and community transit alerts.

Features
Interactive transit map
Route and trip planning
Transit stop search
GPS-based nearest-stop detection
Estimated travel time and fare information
Community-reported transit alerts
English and Urdu language support
Support for multiple Pakistani transit networks
Responsive mobile-friendly interface
Supported Cities
Karachi
Islamabad & Rawalpindi
Lahore
Tech Stack
Next.js — Web application framework
React — User interface
TypeScript — Type-safe development
Tailwind CSS — Styling
Leaflet — Interactive maps
React Leaflet — React integration for Leaflet
Lucide React — Icons
Supabase — Optional persistence for transit reports
Vercel — Deployment
Project Structure
Karachi-Transit/
├── app/
│   ├── api/
│   │   └── reports/
│   │       └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ReportModal.tsx
│   └── TransitMap.tsx
├── data/
│   └── transitData.ts
├── next.config.mjs
├── package.json
├── tailwind.config.js
└── tsconfig.json

Getting Started
Prerequisites
Node.js 18+
npm
Installation

Clone the repository:

git clone https://github.com/dearabesss/Karachi-Transit.git
cd Karachi-Transit


Install dependencies:

npm install


Start the development server:

npm run dev


Open:

http://localhost:3000

Production Build
npm run build
npm start

Environment Variables

Supabase can be configured for persistent community reports.

Create a .env.local file:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key


Without Supabase configuration, the application can fall back to its local report storage implementation.

Routing

Transit routes and stops are maintained in:

data/transitData.ts


The data includes information such as:

Transit routes
Stops
Geographic coordinates
Services
Fare information
City configurations

Additional cities and routes can be added by extending the transit data.

Location Services

The application uses the browser Geolocation API to determine the user's location and identify nearby transit stops.

Users must grant location permission for GPS-based features to work.

Transit Alerts

Users can report transit issues such as:

Delays
Heavy traffic
Bus breakdowns
Overcrowding
Station issues

Reports are handled through the application's reports API.

Data Disclaimer

Transit routes, fares, stop locations, and service information may change. Information provided by the application should be verified with official transit operators before travelling.

Contributing

Contributions are welcome.

Fork the repository.
Create a feature branch.
Make and test your changes.
Commit your changes.
Open a pull request.

Example:

git checkout -b feature/your-feature
git add .
git commit -m "feat: add your feature"
git push origin feature/your-feature

License

No open-source license is currently specified in the repository.

Author

dearabesss

Repository:
https://github.com/dearabesss/Karachi-Transit
