# Team Development Guide (A to Z Implementation)

Hello Team! Each of you is responsible for one **Entity**. To complete your module, follow these 3 steps:

## 1. Controller (`/backend/controllers`)
Create a file like `productController.js`. It should contain functions for:
- `create` (POST)
- `getAll` (GET)
- `getById` (GET)
- `update` (PUT)
- `delete` (DELETE)

**Template:**
```javascript
const Entity = require('../models/Entity');
exports.create = async (req, res) => { /* logic */ };
```

## 2. Routes (`/backend/routes`)
Create a file like `productRoutes.js`. Import your controller and define the endpoints.
**Use Middleware:** Use the `authMiddleware` to protect routes that require login.

```javascript
const router = require('express').Router();
const controller = require('../controllers/entityController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, controller.create); // Protected
router.get('/', controller.getAll); // Public
```

## 3. Server Integration (`/backend/server.js`)
Register your route in the main server file:
```javascript
app.use('/api/products', require('./routes/productRoutes'));
```

---

### Member 6 Special Task: Media & Hosting
1.  **Media**: Install `multer`. Create a route that accepts images and returns the URL.
2.  **Hosting**: Create a free account on **Render** or **Railway**. Link your GitHub repository and set the `MONGO_URI` environment variable from MongoDB Atlas.
