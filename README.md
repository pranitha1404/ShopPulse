\## 1️⃣ Add a scheduler to keep Shopify in sync



We already installed `node-cron` earlier, so just wire it up.



\### (a) Create `src/services/syncScheduler.js`



In backend terminal:



```bash

cd C:\\Users\\prani\\xeno-fde-assignment\\backend

notepad src\\services\\syncScheduler.js

```



Paste this \*\*full file\*\*:



```js

const cron = require("node-cron");

const { PrismaClient } = require("@prisma/client");

const { ingestShopifyDataForTenant } = require("./ingestionService");



const prisma = new PrismaClient();



/\*\*

&nbsp;\* Runs a Shopify sync for all tenants on a schedule.

&nbsp;\* For demo: every 30 minutes.

&nbsp;\*/

function startSyncScheduler() {

&nbsp; // “\*/30 \* \* \* \*” = every 30 minutes

&nbsp; cron.schedule("\*/30 \* \* \* \*", async () => {

&nbsp;   console.log("⏰ Cron: starting scheduled Shopify sync...");



&nbsp;   try {

&nbsp;     const tenants = await prisma.tenant.findMany();

&nbsp;     if (!tenants.length) {

&nbsp;       console.log("⏰ Cron: no tenants found, skipping.");

&nbsp;       return;

&nbsp;     }



&nbsp;     for (const t of tenants) {

&nbsp;       console.log(`⏰ Cron: syncing tenant ${t.id} (${t.shopDomain})`);

&nbsp;       await ingestShopifyDataForTenant(t.id);

&nbsp;     }



&nbsp;     console.log("✅ Cron: sync finished for all tenants");

&nbsp;   } catch (err) {

&nbsp;     console.error("❌ Cron sync failed:", err);

&nbsp;   }

&nbsp; });

}



module.exports = { startSyncScheduler };

```



Save and close.



---



\### (b) Wire scheduler into `src/index.js`



Open your main server file:



```bash

notepad src\\index.js

```



At the \*\*top\*\* (after other `require`s), add:



```js

const { startSyncScheduler } = require("./services/syncScheduler");

```



Now find your `app.listen(...)` at the bottom and change it to:



```js

const PORT = process.env.PORT || 4000;



app.listen(PORT, () => {

&nbsp; console.log("Server started ✔");

&nbsp; // start cron scheduler after server is up

&nbsp; startSyncScheduler();

});

```



Save and close.



---



\### (c) Restart backend and test



```bash

cd C:\\Users\\prani\\xeno-fde-assignment\\backend

node src/index.js

```



You should see:



```text

Server started ✔

```



Every 30 minutes you’ll see logs like:



```text

⏰ Cron: starting scheduled Shopify sync...

⏰ Cron: syncing tenant 1 (xeno-fde-demo-store.myshopify.com)

✅ Ingestion done for tenant 1

✅ Cron: sync finished for all tenants

```



You \*still\* have the manual \*\*“Sync Shopify Data”\*\* button in the UI for demo, but now you can also say in the video:



> “In production, a scheduler runs every 30 minutes to keep data in sync for all tenants.”



That covers the \*\*“Add a scheduler to keep Shopify data in sync”\*\* requirement ✅



---



\## 2️⃣ Deployment plan (summary)





\### Backend → Render



1\. Initialize git in project root (if not already):



&nbsp;  ```bash

&nbsp;  cd C:\\Users\\prani\\xeno-fde-assignment

&nbsp;  git init

&nbsp;  git add .

&nbsp;  git commit -m "Xeno FDE assignment"

&nbsp;  ```



2\. Create a \*\*public GitHub repo\*\* and push:



&nbsp;  ```bash

&nbsp;  git remote add origin https://github.com/<your-username>/xeno-fde-assignment.git

&nbsp;  git push -u origin main

&nbsp;  ```



3\. In \*\*Render\*\*:



&nbsp;  \* “New +” → \*\*Web Service\*\*

&nbsp;  \* Connect repo `xeno-fde-assignment`

&nbsp;  \* Root for backend: `/backend`

&nbsp;  \* Runtime: Node

&nbsp;  \* Build command: `npm install`

&nbsp;  \* Start command: `node src/index.js`

&nbsp;  \* Add environment variables:



&nbsp;    \* `PORT` = `4000`

&nbsp;    \* `JWT\_SECRET` = anything

&nbsp;    \* `DATABASE\_URL` (for sqlite if needed, or not if Prisma uses file)

&nbsp;    \* `SHOPIFY\_ACCESS\_TOKEN`, `SHOPIFY\_SHOP\_DOMAIN` (the ones you use now)



4\. Deploy → note the URL, e.g. `https://xeno-fde-backend.onrender.com`



\### Frontend → Vercel (or Netlify)



1\. In `frontend`, push code to the same repo (it already is).



2\. On \*\*Vercel\*\*:



&nbsp;  \* New Project → select GitHub repo

&nbsp;  \* Framework: Vite + React

&nbsp;  \* Root directory: `/frontend`

&nbsp;  \* Build command: `npm run build`

&nbsp;  \* Output dir: `dist`

&nbsp;  \* Environment variable:



&nbsp;    \* `VITE\_API\_BASE\_URL` = your backend URL, e.g. `https://xeno-fde-backend.onrender.com/api`



3\. Deploy → you’ll get a URL like

&nbsp;  `https://shoppulse-yourname.vercel.app`



Then:



\* Open that URL

\* Log in with `admin@example.com / password123`

\* Click sync → dashboard works from the cloud ✅



---



\## 3️⃣ README + Documentation outline



Put this in \*\*`README.md`\*\* at project root and then customize:



````md

\# ShopPulse – Xeno FDE Internship Assignment



Multi-tenant Shopify data ingestion \& insights service.



\## Tech Stack



\- Backend: Node.js, Express, Prisma, SQLite

\- Frontend: React + Vite

\- Auth: JWT (email + password)

\- Scheduler: node-cron

\- Shopify: Admin REST API

\- Deployment: Render (backend), Vercel (frontend)



\## Features



\- Tenant onboarding with Shopify domain + access token

\- Secure email-based login

\- Ingestion of:

&nbsp; - Customers

&nbsp; - Products

&nbsp; - Orders

\- Multi-tenant isolation via `tenantId`

\- Insights dashboard:

&nbsp; - Total customers, orders, revenue

&nbsp; - Revenue trend by date range

&nbsp; - Top 5 customers by spend

\- Scheduled sync every 30 minutes + manual sync button



\## Local Setup



```bash

\# backend

cd backend

npm install

npx prisma migrate dev

node seed.js   # creates tenant + admin user

node src/index.js



\# frontend

cd ../frontend

npm install

npm run dev

````



Login details (local):



\* Email: `admin@example.com`

\* Password: `password123`



Set these in `backend/.env`:



```env

SHOPIFY\_SHOP\_DOMAIN=xeno-fde-demo-store.myshopify.com

SHOPIFY\_ACCESS\_TOKEN=shpat\_...

JWT\_SECRET=supersecret

```



\## API Endpoints



\* `POST /api/auth/login` – email/password login

\* `POST /api/ingest/run` – manually trigger Shopify sync for current tenant

\* `GET /api/metrics/summary` – total customers, orders, revenue

\* `GET /api/metrics/orders-by-date?start=\&end=` – revenue trend

\* `GET /api/metrics/top-customers` – top 5 customers by spend



```



1\. \*\*Assumptions\*\*

&nbsp;  - 1 Shopify dev store per tenant

&nbsp;  - Admin API token provided securely at onboarding

&nbsp;  - SQLite used for assignment; would switch to Postgres in production, etc.



2\. \*\*High-Level Architecture\*\*

&nbsp;  - Simple diagram: Shopify → Ingestion Service → DB → Metrics Service → React Dashboard

&nbsp;  - Mention scheduler + webhooks (future).



3\. \*\*APIs + Data Models\*\*

&nbsp;  - Show main Prisma models: `Tenant`, `User`, `Customer`, `Product`, `Order`

&nbsp;  - List the main routes (from README).



4\. \*\*Next Steps for Production\*\*

&nbsp;  - Move to Postgres

&nbsp;  - Add proper OAuth for Shopify app

&nbsp;  - Add retries / dead-letter queue (e.g., RabbitMQ)

&nbsp;  - Multi-region deployment \& monitoring, etc.



But code-wise, you we have:



✅ Multi-tenant ingestion  

✅ Scheduler  

✅ Metrics dashboard  

✅ Shopify dev store hooked in  





