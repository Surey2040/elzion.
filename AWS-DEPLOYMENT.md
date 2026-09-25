# AWS deployment

This package is ready for AWS Elastic Beanstalk using the Node.js 20 platform.

## Deploy

1. Create a new **Web server environment** with the current Node.js 20 platform.
2. Upload `elzion.f.zip` as the application version.
3. Keep the environment load balancer health-check path set to `/api/health`.
4. Set `FRONTEND_ORIGIN` in the Elastic Beanstalk environment properties to the final HTTPS domain. Do not commit secrets to `.env`.
5. After the environment is healthy, connect the custom domain through Route 53 and add HTTPS with an ACM certificate on the load balancer.

AWS supplies `PORT`; the Express server reads it automatically. During installation, the root `postinstall` script installs frontend/backend dependencies and builds the Vite application. Express then serves the production frontend and `/api/health` from one process.

## Local production check

```bash
npm run install:all
npm run build
npm start
```

Open `http://localhost:5000` and verify `http://localhost:5000/api/health`.
