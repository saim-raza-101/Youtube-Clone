# Vidora - Comprehensive Analysis & Mastery Roadmap

## 📊 Project Overview

Vidora is a **MERN Stack** video sharing platform with:
- **Backend**: Express.js + MongoDB + JWT Auth + Cloudinary
- **Frontend**: React 19 + Vite + Tailwind CSS 4 + Framer Motion
- **Current Status**: Functional but with room for industry-standard improvements

---

## 🎯 Your Goal

**Master Full-Stack Development** by systematically improving Vidora through:
1. **Architecture Refinement** - Industry best practices
2. **New Feature Implementation** - Advanced concepts
3. **Performance Optimization** - Production-grade scaling
4. **Security Hardening** - Enterprise-level protection
5. **Modern Tooling** - Cutting-edge technologies

---

# 🚀 PHASE 1: FOUNDATION IMPROVEMENTS (Weeks 1-2)

## Backend Improvements

### 1.1 TypeScript Migration (Critical Learning)
**What You'll Learn:**
- Strong typing in Node.js
- Type inference and generics
- Interface vs type aliases
- Type guards and utility types

**Implementation:**
- Convert all backend files to TypeScript
- Create type definitions for:
  - Request/Response types
  - MongoDB document interfaces
  - API route interfaces
  - Custom middleware types

**Files to Create/Modify:**
```
backend/tsconfig.json
backend/src/types/index.ts
backend/src/types/user.types.ts
backend/src/types/video.types.ts
backend/src/types/api.types.ts
```

**Benefits:**
- Catch errors at compile time
- Better IDE support
- Improved code maintainability
- Industry-standard practice

---

### 1.2 Input Validation & Sanitization (Security)
**What You'll Learn:**
- Zod schema validation
- Input sanitization patterns
- Middleware-based validation
- Error handling best practices

**Implementation:**
```javascript
// Install: npm install zod
import { z } from 'zod';

const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  fullName: z.string().min(2).max(50)
});

// Create validation middleware
const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ 
      success: false, 
      errors: result.error.format() 
    });
  }
  req.body = result.data;
  next();
};
```

**Apply to all routes:**
- User registration/login
- Video upload/update
- Comments
- Playlists

---

### 1.3 Security Hardening
**What You'll Learn:**
- Helmet for security headers
- Rate limiting
- CORS configuration best practices
- MongoDB injection prevention

**Implementation:**
```javascript
// Install: npm install helmet express-rate-limit
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// In app.js
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});

app.use('/api/v1/', limiter);

// Sanitize MongoDB queries
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (Array.isArray(obj)) return obj.map(sanitize);
    if (typeof obj === 'object' && obj !== null) {
      return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, sanitize(v)])
      );
    }
    if (typeof obj === 'string') {
      return obj.replace(/\$\{\w+\}/g, ''); // Remove NoSQL injection patterns
    }
    return obj;
  };
  
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
});
```

---

### 1.4 Error Handling System
**What You'll Learn:**
- Custom error classes
- Centralized error handling
- Error logging (Winston/Morgan)
- Error response standardization

**Implementation:**
```javascript
// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

class AuthError extends AppError {
  constructor(message) {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403);
  }
}

// Global error handler
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Log to error tracking service
  console.error(`[${err.statusCode}] ${err.message}`);
  
  // Handle mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(el => el.message);
    err = new ValidationError('Validation failed', errors);
  }
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    err = new AuthError('Invalid token, please login again');
  }
  
  if (err.name === 'TokenExpiredError') {
    err = new AuthError('Token expired, please login again');
  }
  
  // Send response
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    ...(err.errors && { errors: err.errors })
  });
};
```

---

### 1.5 API Documentation (Swagger/OpenAPI)
**What You'll Learn:**
- API documentation standards
- OpenAPI/Swagger specification
- Automated documentation generation

**Implementation:**
```javascript
// Install: npm install swagger-jsdoc swagger-ui-express
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vidora API',
      version: '1.0.0',
      description: 'Video sharing platform API',
    },
    servers: [
      { url: 'http://localhost:8000/api/v1' },
      { url: 'https://api.vidora.com/api/v1' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(specs));
```

Add JSDoc comments to routes:
```javascript
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
```

---

## Frontend Improvements

### 1.6 TypeScript Migration (Frontend)
**What You'll Learn:**
- React with TypeScript
- Component props typing
- Hooks with TypeScript
- API response typing

**Implementation:**
```typescript
// tsconfig.json for frontend
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Type Definitions:**
```typescript
// src/types/user.types.ts
interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: {
    url: string;
    public_id: string;
  };
  coverImage: {
    url: string;
    public_id: string;
  };
  WatchHistory: string[];
  createdAt: string;
  updatedAt: string;
}

// src/types/api.types.ts
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
```

---

### 1.7 React Architecture Improvements
**What You'll Learn:**
- Component composition patterns
- Compound components
- Render props
- Higher-order components
- Custom hooks best practices

**Implementation:**

**1. Compound Components Pattern (for forms):**
```jsx
// components/ui/Form.jsx
import { createContext, useContext, useState } from 'react';

const FormContext = createContext();

export const Form = ({ children, onSubmit, initialValues = {} }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormContext.Provider value={{ values, errors, handleChange, isSubmitting }}>
      <form onSubmit={handleSubmit}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

export const FormField = ({ name, children }) => {
  const { values, errors, handleChange } = useContext(FormContext);
  return React.Children.map(children, child => {
    return React.cloneElement(child, {
      value: values[name],
      onChange: (e) => handleChange(name, e.target.value),
      error: errors[name],
      name
    });
  });
};
```

**2. Better Hook Organization:**
```bash
frontend/src/hooks/
├── auth/
│   ├── useLogin.ts
│   ├── useRegister.ts
│   ├── useLogout.ts
│   └── index.ts
├── videos/
│   ├── useVideoUpload.ts
│   ├── useVideoList.ts
│   ├── useVideoDetails.ts
│   └── index.ts
├── ui/
│   ├── useToast.ts
│   ├── useModal.ts
│   ├── useTheme.ts
│   └── index.ts
└── index.ts
```

---

### 1.8 State Management (Advanced Patterns)
**What You'll Learn:**
- React Query for server state
- Zustand for client state
- Context API optimization
- Performance optimization with memoization

**Implementation:**

**Install React Query:**
```bash
npm install @tanstack/react-query
```

**Setup:**
```jsx
// src/providers/QueryProvider.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const QueryProvider = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
```

**Usage in components:**
```jsx
// Custom hook for videos
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useVideos = (params = {}) => {
  return useQuery({
    queryKey: ['videos', params],
    queryFn: async () => {
      const response = await api.get('/videos', { params });
      return response.data.data;
    },
    placeholderData: [],
  });
};

export const useLikeVideo = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (videoId) => {
      const response = await api.post(`/likes/toggle/v/${videoId}`);
      return response.data;
    },
    onMutate: async (videoId) => {
      await queryClient.cancelQueries({ queryKey: ['videos'] });
      const previousVideos = queryClient.getQueryData(['videos']);
      queryClient.setQueryData(['videos'], (old) => 
        old.map(video => 
          video._id === videoId 
            ? { ...video, isLiked: !video.isLiked } 
            : video
        )
      );
      return { previousVideos };
    },
    onError: (err, videoId, context) => {
      queryClient.setQueryData(['videos'], context.previousVideos);
    },
  });
};
```

---

### 1.9 Performance Optimization
**What You'll Learn:**
- React.memo and useMemo
- useCallback for event handlers
- Code splitting with React.lazy
- Image optimization
- Bundle analysis

**Implementation:**

**1. React.memo for Components:**
```jsx
// VideoCard.jsx
import { memo } from 'react';

export const VideoCard = memo(({ video, onClick }) => {
  // Component logic
  return (
    <div onClick={() => onClick(video._id)}>
      {/* Video card content */}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function
  return prevProps.video._id === nextProps.video._id &&
         prevProps.onClick === nextProps.onClick;
});
```

**2. Code Splitting:**
```jsx
// App.jsx
import { lazy, Suspense } from 'react';

const VideoPlayer = lazy(() => import('./pages/VideoPlayer'));
const Upload = lazy(() => import('./pages/Upload'));
const Channel = lazy(() => import('./pages/Channel'));

// Usage
<Suspense fallback={<LoadingSpinner />}>
  <VideoPlayer />
</Suspense>
```

**3. Image Optimization:**
```jsx
// Install: npm install react-lazy-load-image-component
import { LazyLoadImage } from 'react-lazy-load-image-component';

<LazyLoadImage
  src={video.thumbnail.url}
  alt={video.title}
  width="100%"
  height="auto"
  effect="blur"
  placeholderSrc="/placeholder-thumbnail.jpg"
/>
```

**4. Virtualization for Lists:**
```bash
npm install react-window
```
```jsx
import { FixedSizeList as List } from 'react-window';

const VideoList = ({ videos }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <VideoCard video={videos[index]} />
    </div>
  );

  return (
    <List
      height={600}
      itemCount={videos.length}
      itemSize={300}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

---

## DevOps & Tooling

### 1.10 Environment Configuration
**What You'll Learn:**
- Environment variable management
- Configuration validation
- Multiple environment support

**Implementation:**
```javascript
// backend/src/config/index.js
import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Define schema
const configSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),
  MONGODB_URI: z.string().url(),
  JWT_ACCESS_TOKEN_SECRET: z.string().min(32),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('1d'),
  JWT_REFRESH_TOKEN_SECRET: z.string().min(32),
  JWT_REFRESH_TOKEN_EXPIRY: z.string().default('7d'),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CORS_ORIGIN: z.string().url(),
});

// Validate and export
export const config = configSchema.parse(process.env);

// Export helper for TypeScript
export type Config = z.infer<typeof configSchema>;
```

---

### 1.11 Logging System
**What You'll Learn:**
- Structured logging
- Log levels and filters
- Log rotation
- Error tracking integration

**Implementation:**
```javascript
// Install: npm install winston winston-daily-rotate-file
import winston from 'winston';
import path from 'path';

const { combine, timestamp, printf, colorize, json } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  transports: [
    // Console transport (colored in development)
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    }),
    // Daily rotating files
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: combine(
        timestamp(),
        json()
      )
    }),
    // Error logs
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: path.join('logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      format: combine(
        timestamp(),
        json()
      )
    })
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'exceptions-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d'
    })
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      filename: path.join('logs', 'rejections-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d'
    })
  ]
});

export default logger;
```

---

# 🎉 PHASE 2: NEW FEATURES & ADVANCED CONCEPTS (Weeks 3-6)

## 2.1 Real-Time Features (WebSocket)
**What You'll Learn:**
- WebSocket implementation
- Real-time data synchronization
- Socket.IO for Node.js
- Broadcast and rooms
- Fallback mechanisms

**Implementation:**

**Backend Setup:**
```javascript
// Install: npm install socket.io
import { Server } from 'socket.io';
import http from 'http';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // Join video room
  socket.on('join-video', (videoId) => {
    socket.join(`video-${videoId}`);
    console.log(`Socket ${socket.id} joined video-${videoId}`);
  });

  // Leave video room
  socket.on('leave-video', (videoId) => {
    socket.leave(`video-${videoId}`);
    console.log(`Socket ${socket.id} left video-${videoId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Update index.js to use server instead of app
export { server, io };
```

**Real-time Features to Implement:**

1. **Live View Count:**
```javascript
// In video controller
io.to(`video-${videoId}`).emit('view-count-update', {
  videoId,
  viewCount: updatedVideo.views
});
```

2. **Real-time Comments:**
```javascript
// When a new comment is created
io.to(`video-${videoId}`).emit('new-comment', {
  comment: newComment,
  videoId
});
```

3. **Live Notifications:**
```javascript
// When user gets a notification
io.to(`user-${userId}`).emit('new-notification', {
  notification: newNotification
});
```

**Frontend Setup:**
```jsx
// Install: npm install socket.io-client
import { io } from 'socket.io-client';

// Create socket context
const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) return;

    const newSocket = io(process.env.VITE_API_BASE_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

// Custom hook
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
```

---

### 2.2 Advanced Search & Filtering
**What You'll Learn:**
- Full-text search implementation
- Elasticsearch or MongoDB Atlas Search
- Filtering and faceted search
- Search result ranking

**Implementation:**

**Option 1: MongoDB Atlas Search (Recommended for simplicity)**
```javascript
// In video controller
const searchVideos = async (req, res) => {
  const { query, category, sortBy, page = 1, limit = 20 } = req.query;

  const pipeline = [
    {
      $search: {
        index: 'video_search',
        compound: {
          must: [
            query && {
              text: {
                query: query,
                path: ['title', 'description'],
                fuzzy: {
                  maxEdits: 2,
                },
              },
            },
            category && {
              text: {
                query: category,
                path: 'category',
              },
            },
          ].filter(Boolean),
          filter: [
            { isPublished: true },
          ],
        },
      },
    },
    {
      $project: {
        title: 1,
        description: 1,
        thumbnail: 1,
        views: 1,
        duration: 1,
        createdAt: 1,
        owner: 1,
        score: { $meta: 'searchScore' },
      },
    },
    { $sort: getSortStage(sortBy) },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const [videos, total] = await Promise.all([
    Video.aggregate(pipeline),
    Video.aggregate([...pipeline, { $count: 'count' }]),
  ]);

  res.json({
    success: true,
    data: videos,
    total: total[0]?.count || 0,
    page: Number(page),
    totalPages: Math.ceil((total[0]?.count || 0) / limit),
  });
};

function getSortStage(sortBy) {
  switch (sortBy) {
    case 'views': return { views: -1 };
    case 'date': return { createdAt: -1 };
    case 'duration': return { duration: 1 };
    default: return { score: -1 };
  }
}
```

**Option 2: Elasticsearch (More advanced)**
```javascript
// Install: npm install @elastic/elasticsearch
import { Client } from '@elastic/elasticsearch';

const esClient = new Client({
  node: process.env.ELASTICSEARCH_URL,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
});

// Index videos
const indexVideo = async (video) => {
  await esClient.index({
    index: 'videos',
    id: video._id.toString(),
    body: {
      title: video.title,
      description: video.description,
      category: video.category,
      owner: video.owner.username,
      views: video.views,
      duration: video.duration,
      createdAt: video.createdAt,
    },
  });
};

// Search videos
const searchVideos = async (query, filters) => {
  const result = await esClient.search({
    index: 'videos',
    body: {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query: query,
                fields: ['title^3', 'description^2', 'category'],
                fuzziness: 'AUTO',
              },
            },
          ],
          filter: [
            { term: { isPublished: true } },
            ...Object.entries(filters).map(([key, value]) => ({
              term: { [key]: value },
            })),
          ],
        },
      },
      sort: filters.sortBy ? [{ [filters.sortBy]: 'desc' }] : [],
      from: (filters.page - 1) * filters.limit,
      size: filters.limit,
      highlight: {
        fields: {
          title: {},
          description: {},
        },
      },
    },
  });

  return result.hits.hits.map(hit => ({
    ...hit._source,
    score: hit._score,
    highlight: hit.highlight,
  }));
};
```

**Frontend Search Component:**
```jsx
// components/search/SearchBar.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Debounced search for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        // Call API for search suggestions
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchSuggestions = async (q) => {
    try {
      const response = await api.get('/videos/search/suggestions', {
        params: { query: q }
      });
      setSuggestions(response.data.data);
    } catch (err) {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?query=${encodeURIComponent(query)}`);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion);
    navigate(`/search?query=${encodeURIComponent(suggestion)}`);
    setIsFocused(false);
  };

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <Search className="w-5 h-5 text-text-secondary" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="Search videos..."
          className="w-full pl-10 pr-4 py-2 bg-[var(--color-search-bg)] border border-border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
        />
      </form>
      
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-search-bg)] border border-border-default rounded-lg shadow-lg z-50 overflow-hidden">
          {suggestions.map((s, index) => (
            <button
              key={index}
              onClick={() => handleSelectSuggestion(s)}
              className="w-full px-4 py-2 text-left hover:bg-[var(--color-overlay-hover)] transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

### 2.3 Notifications System
**What You'll Learn:**
- Notification architecture
- Real-time updates with WebSocket
- Notification preferences
- Read/unread tracking

**Implementation:**

**Backend:**
```javascript
// models/notification.model.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: [
      'like',           // Someone liked your video
      'comment',        // Someone commented on your video
      'reply',          // Someone replied to your comment
      'subscribe',      // Someone subscribed to your channel
      'mention',        // Someone mentioned you in a comment
      'collaboration',  // Collaboration request
    ],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  entityType: {
    type: String,
    enum: ['video', 'comment', 'user', 'playlist'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  link: {
    type: String,
    required: true,
  },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
```

**Notification Controller:**
```javascript
// controllers/notification.controller.js
import { Notification } from '../models/notification.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get user notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { _id: userId } = req.user;

  const [notifications, total] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('sender', 'username avatar fullName'),
    Notification.countDocuments({ recipient: userId }),
  ]);

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  res.json({
    success: true,
    data: notifications,
    total,
    unreadCount,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  });
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const { _id: userId } = req.user;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found',
    });
  }

  // Emit update via WebSocket
  if (req.io) {
    req.io.to(`user-${userId}`).emit('notification-updated', {
      notificationId,
      isRead: true,
    });
  }

  res.json({
    success: true,
    data: notification,
  });
});

// Mark all as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;

  await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true }
  );

  // Emit update via WebSocket
  if (req.io) {
    req.io.to(`user-${userId}`).emit('notifications-read');
  }

  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
});

// Create notification (helper function)
export const createNotification = async (data) => {
  const notification = new Notification(data);
  await notification.save();
  
  // Emit real-time notification
  if (global.io) {
    global.io.to(`user-${data.recipient}`).emit('new-notification', {
      notification,
    });
  }
  
  return notification;
};
```

**Notification Triggers (in existing controllers):**
```javascript
// In like.controller.js
import { createNotification } from '../controllers/notification.controller.js';

// After successful like
await createNotification({
  recipient: video.owner,
  sender: req.user._id,
  type: 'like',
  entityId: video._id,
  entityType: 'video',
  message: `${req.user.fullName} liked your video: ${video.title}`,
  link: `/video/${video._id}`,
});

// In comment.controller.js
await createNotification({
  recipient: video.owner,
  sender: req.user._id,
  type: 'comment',
  entityId: comment._id,
  entityType: 'comment',
  message: `${req.user.fullName} commented on your video: ${video.title}`,
  link: `/video/${video._id}#comment-${comment._id}`,
});

// In subscription.controller.js
await createNotification({
  recipient: channelOwner._id,
  sender: req.user._id,
  type: 'subscribe',
  entityId: req.user._id,
  entityType: 'user',
  message: `${req.user.fullName} subscribed to your channel`,
  link: `/channel/${channelOwner.username}`,
});
```

**Frontend Notification Component:**
```jsx
// components/layout/NotificationDropdown.jsx
import { useState, useEffect, useRef } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  // WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('new-notification', (data) => {
      setNotifications(prev => [data.notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    socket.on('notification-updated', ({ notificationId, isRead }) => {
      if (isRead) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    });

    socket.on('notifications-read', () => {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });

    return () => {
      socket.off('new-notification');
      socket.off('notification-updated');
      socket.off('notifications-read');
    };
  }, [socket]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open dropdown
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg hover:bg-[var(--color-overlay-hover)] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--color-search-bg)] border border-border-default rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-border-default">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-accent hover:text-accent-hover"
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <Spinner size="sm" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-text-secondary">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <button
                  key={notification._id}
                  onClick={() => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification._id);
                    }
                    setIsOpen(false);
                    // Navigate to the link
                    window.location.href = notification.link;
                  }}
                  className={`w-full p-4 text-left hover:bg-[var(--color-overlay-hover)] transition-colors border-b border-border-default last:border-0 ${
                    !notification.isRead ? 'bg-[var(--color-overlay-hover)]' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {notification.sender?.avatar?.url && (
                      <img
                        src={notification.sender.avatar.url}
                        alt={notification.sender.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.sender?.fullName}</p>
                      <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-accent rounded-full mt-1.5" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
```

---

### 2.4 Analytics Dashboard
**What You'll Learn:**
- Data aggregation pipelines
- Chart visualization (Chart.js)
- Time-series data
- Performance metrics

**Implementation:**

**Backend Analytics Controller:**
```javascript
// controllers/analytics.controller.js
import { Video } from '../models/video.model.js';
import { User } from '../models/user.model.js';
import { Like } from '../models/like.model.js';
import { Comment } from '../models/comment.model.js';
import { Subscription } from '../models/subscription.model.js';

export const getChannelAnalytics = async (req, res) => {
  const { _id: userId } = req.user;
  const { period = '30d' } = req.query;

  const dateFilter = getDateFilter(period);

  // Get video statistics
  const [videosStats, viewerStats, likeStats, commentStats, subscriberStats] = 
    await Promise.all([
      // Video uploads over time
      Video.aggregate([
        { $match: { owner: userId, ...dateFilter } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]),
      
      // Views over time
      Video.aggregate([
        { $match: { owner: userId, ...dateFilter } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          views: { $sum: '$views' }
        }},
        { $sort: { _id: 1 } }
      ]),
      
      // Likes over time
      Like.aggregate([
        { $match: { video: { $in: await getUserVideoIds(userId) }, ...dateFilter } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]),
      
      // Comments over time
      Comment.aggregate([
        { $match: { video: { $in: await getUserVideoIds(userId) }, ...dateFilter } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]),
      
      // Subscribers over time
      Subscription.aggregate([
        { $match: { channel: userId, ...dateFilter } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

  // Get top videos
  const topVideos = await Video.find({ owner: userId })
    .sort({ views: -1 })
    .limit(5)
    .select('title views thumbnail createdAt');

  // Get audience demographics
  const audienceDemo = await getAudienceDemographics(userId, period);

  // Get summary stats
  const summary = await getSummaryStats(userId, period);

  res.json({
    success: true,
    data: {
      summary,
      charts: {
        videos: videosStats,
        views: viewerStats,
        likes: likeStats,
        comments: commentStats,
        subscribers: subscriberStats,
      },
      topVideos,
      audienceDemo,
    },
  });
};

function getDateFilter(period) {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case '7d':
      start.setDate(now.getDate() - 7);
      break;
    case '30d':
      start.setDate(now.getDate() - 30);
      break;
    case '90d':
      start.setDate(now.getDate() - 90);
      break;
    case '1y':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }
  
  return { createdAt: { $gte: start, $lte: now } };
}

async function getUserVideoIds(userId) {
  const videos = await Video.find({ owner: userId }).select('_id');
  return videos.map(v => v._id);
}

async function getSummaryStats(userId, period) {
  const dateFilter = getDateFilter(period);
  
  const [totalVideos, totalViews, totalLikes, totalComments, totalSubscribers] = 
    await Promise.all([
      Video.countDocuments({ owner: userId, ...dateFilter }),
      Video.aggregate([
        { $match: { owner: userId, ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$views' } } }
      ]),
      Like.countDocuments({ video: { $in: await getUserVideoIds(userId) }, ...dateFilter }),
      Comment.countDocuments({ video: { $in: await getUserVideoIds(userId) }, ...dateFilter }),
      Subscription.countDocuments({ channel: userId, ...dateFilter })
    ]);

  return {
    totalVideos: totalVideos || 0,
    totalViews: (totalViews[0]?.total || 0),
    totalLikes: totalLikes || 0,
    totalComments: totalComments || 0,
    totalSubscribers: totalSubscribers || 0,
  };
}

async function getAudienceDemographics(userId, period) {
  // Implementation based on user data from likes, comments, subscriptions
  return {
    byCountry: [],
    byAge: [],
    byGender: [],
  };
}
```

**Frontend Analytics Dashboard:**
```jsx
// pages/Analytics.jsx
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import api from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const [period, setPeriod] = useState('30d');
  
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics', period],
    queryFn: async () => {
      const response = await api.get('/dashboard/analytics', {
        params: { period }
      });
      return response.data.data;
    },
  });

  const chartColors = {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4',
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  // Prepare chart data
  const prepareLineData = (data, label) => ({
    labels: data.map(d => d._id),
    datasets: [
      {
        label,
        data: data.map(d => d.count || d.views || 0),
        borderColor: chartColors.primary,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  });

  if (isLoading) return <AnalyticsSkeleton />;
  if (error) return <ErrorState message="Failed to load analytics" />;

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Videos"
          value={analytics.summary.totalVideos}
          icon={<Video className="w-6 h-6" />}
          change={0}
        />
        <StatCard
          title="Total Views"
          value={analytics.summary.totalViews.toLocaleString()}
          icon={<Eye className="w-6 h-6" />}
          change={0}
        />
        <StatCard
          title="Total Likes"
          value={analytics.summary.totalLikes.toLocaleString()}
          icon={<ThumbsUp className="w-6 h-6" />}
          change={0}
        />
        <StatCard
          title="Total Comments"
          value={analytics.summary.totalComments.toLocaleString()}
          icon={<MessageSquare className="w-6 h-6" />}
          change={0}
        />
        <StatCard
          title="Subscribers"
          value={analytics.summary.totalSubscribers.toLocaleString()}
          icon={<Users className="w-6 h-6" />}
          change={0}
        />
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPeriod('7d')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === '7d' 
              ? 'bg-accent text-white' 
              : 'bg-[var(--color-search-bg)] text-text-primary hover:bg-[var(--color-overlay-hover)]'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setPeriod('30d')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === '30d' 
              ? 'bg-accent text-white' 
              : 'bg-[var(--color-search-bg)] text-text-primary hover:bg-[var(--color-overlay-hover)]'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setPeriod('90d')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === '90d' 
              ? 'bg-accent text-white' 
              : 'bg-[var(--color-search-bg)] text-text-primary hover:bg-[var(--color-overlay-hover)]'
          }`}
        >
          Last 90 Days
        </button>
        <button
          onClick={() => setPeriod('1y')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            period === '1y' 
              ? 'bg-accent text-white' 
              : 'bg-[var(--color-search-bg)] text-text-primary hover:bg-[var(--color-overlay-hover)]'
          }`}
        >
          Last Year
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <ChartCard title="Views Over Time">
          <div className="h-64">
            <Line
              data={prepareLineData(analytics.charts.views, 'Views')}
              options={lineChartOptions}
            />
          </div>
        </ChartCard>

        {/* Subscribers Chart */}
        <ChartCard title="Subscribers Over Time">
          <div className="h-64">
            <Line
              data={prepareLineData(analytics.charts.subscribers, 'Subscribers')}
              options={lineChartOptions}
            />
          </div>
        </ChartCard>

        {/* Videos & Likes Chart */}
        <ChartCard title="Content Engagement">
          <div className="h-64">
            <Bar
              data={{
                labels: analytics.charts.videos.map(d => d._id),
                datasets: [
                  {
                    label: 'Videos Uploaded',
                    data: analytics.charts.videos.map(d => d.count || 0),
                    backgroundColor: chartColors.primary,
                  },
                  {
                    label: 'Likes Received',
                    data: analytics.charts.likes.map(d => d.count || 0),
                    backgroundColor: chartColors.secondary,
                  },
                ],
              }}
              options={{
                ...lineChartOptions,
                plugins: {
                  legend: { position: 'top' },
                },
              }}
            />
          </div>
        </ChartCard>

        {/* Comments & Interaction */}
        <ChartCard title="Audience Interaction">
          <div className="h-64">
            <Bar
              data={{
                labels: analytics.charts.comments.map(d => d._id),
                datasets: [
                  {
                    label: 'Comments',
                    data: analytics.charts.comments.map(d => d.count || 0),
                    backgroundColor: chartColors.success,
                  },
                ],
              }}
              options={lineChartOptions}
            />
          </div>
        </ChartCard>
      </div>

      {/* Top Videos */}
      <ChartCard title="Top Performing Videos">
        <div className="space-y-4">
          {analytics.topVideos.map((video, index) => (
            <div
              key={video._id}
              className="flex items-center gap-4 p-4 bg-[var(--color-search-bg)] rounded-lg"
            >
              <span className="text-2xl font-bold text-text-secondary">
                {index + 1}
              </span>
              <img
                src={video.thumbnail.url}
                alt={video.title}
                className="w-16 h-12 object-cover rounded-lg"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{video.title}</h4>
                <p className="text-sm text-text-secondary">
                  {video.views.toLocaleString()} views • {formatDate(video.createdAt)}
                </p>
              </div>
              <span className="text-sm font-medium text-accent">
                {video.views.toLocaleString()} views
              </span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
};

const StatCard = ({ title, value, icon, change }) => (
  <div className="bg-[var(--color-search-bg)] rounded-xl p-6 border border-border-default">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-accent/10 rounded-lg text-accent">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-text-secondary mt-1">{title}</p>
      </div>
    </div>
    {change !== undefined && (
      <p className={`text-sm mt-2 flex items-center gap-1 ${
        change >= 0 ? 'text-green-500' : 'text-red-500'
      }`}>
        {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
      </p>
    )}
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-[var(--color-search-bg)] rounded-xl p-6 border border-border-default">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);

const AnalyticsSkeleton = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-[var(--color-search-bg)] rounded-xl p-6 border border-border-default animate-pulse">
          <div className="h-4 bg-[var(--color-overlay-hover)] rounded w-3/4 mb-2" />
          <div className="h-8 bg-[var(--color-overlay-hover)] rounded w-1/2" />
        </div>
      ))}
    </div>
    <div className="h-8 bg-[var(--color-overlay-hover)] rounded w-1/4" />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[var(--color-search-bg)] rounded-xl p-6 border border-border-default animate-pulse">
          <div className="h-4 bg-[var(--color-overlay-hover)] rounded w-1/2 mb-4" />
          <div className="h-64 bg-[var(--color-overlay-hover)] rounded" />
        </div>
      ))}
    </div>
  </div>
);

export default Analytics;
```

---

### 2.5 Playlist Enhancements
**What You'll Learn:**
- Drag and drop reordering
- Playlist privacy (public/private/unlisted)
- Collaborative playlists
- Playlist queue

**Implementation:**

**Backend - Playlist Model Updates:**
```javascript
// Add to playlist.model.js
const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  videos: [{
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    position: {
      type: Number,
      required: true,
    },
  }],
  privacy: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public',
  },
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    role: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isQueue: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });
```

**Reorder Playlist Videos:**
```javascript
// controllers/playlist.controller.js
export const reorderPlaylistVideos = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId, newPosition } = req.body;
  const { _id: userId } = req.user;

  const playlist = await Playlist.findOne({
    _id: playlistId,
    owner: userId,
  });

  if (!playlist) {
    throw new AppError('Playlist not found or not authorized', 404);
  }

  // Find the video in the playlist
  const videoIndex = playlist.videos.findIndex(v => v.video.toString() === videoId);

  if (videoIndex === -1) {
    throw new AppError('Video not found in playlist', 404);
  }

  // Remove the video from its current position
  const [videoToMove] = playlist.videos.splice(videoIndex, 1);

  // Insert at the new position
  playlist.videos.splice(newPosition, 0, {
    ...videoToMove,
    position: newPosition,
  });

  // Update positions for all videos
  playlist.videos = playlist.videos.map((v, index) => ({
    ...v,
    position: index,
  }));

  await playlist.save();

  res.json({
    success: true,
    data: playlist,
  });
});
```

**Frontend - Drag and Drop Playlist:**
```jsx
// Install: npm install react-beautiful-dnd
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const PlaylistVideos = ({ playlist, onReorder }) => {
  const [videos, setVideos] = useState(playlist.videos);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(videos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setVideos(items);

    // Call API to update order
    onReorder(reorderedItem.video._id, result.destination.index);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="playlist-videos">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-3"
          >
            {videos.map((item, index) => (
              <Draggable
                key={item.video._id}
                draggableId={item.video._id}
                index={index}
              >
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-[var(--color-search-bg)] p-4 rounded-lg border border-border-default"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-text-secondary">
                        {item.position + 1}
                      </span>
                      <img
                        src={item.video.thumbnail.url}
                        alt={item.video.title}
                        className="w-20 h-14 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.video.title}</h4>
                        <p className="text-sm text-text-secondary">
                          {formatDuration(item.video.duration)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
```

---

### 2.6 Watch Parties (Real-time Collaboration)
**What You'll Learn:**
- Real-time synchronization
- WebSocket rooms
- Video playback synchronization
- Chat during watch party

**Implementation:**

**Backend - Watch Party Model:**
```javascript
// models/watchParty.model.js
import mongoose from 'mongoose';

const watchPartySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  isPlaying: {
    type: Boolean,
    default: false,
  },
  currentTime: {
    type: Number,
    default: 0,
  },
  playTime: {
    type: Date,
    default: null,
  },
  chat: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  startedAt: {
    type: Date,
    default: Date.now,
  },
  maxParticipants: {
    type: Number,
    default: 50,
  },
}, { timestamps: true });

export const WatchParty = mongoose.model('WatchParty', watchPartySchema);
```

**Watch Party Controller:**
```javascript
// controllers/watchParty.controller.js
export const createWatchParty = asyncHandler(async (req, res) => {
  const { name, videoId } = req.body;
  const { _id: userId } = req.user;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new AppError('Video not found', 404);
  }

  const watchParty = new WatchParty({
    name,
    host: userId,
    video: videoId,
    participants: [{ user: userId }],
  });

  await watchParty.save();

  // Join the room
  req.io.socketsJoin(`watch-party-${watchParty._id}`);

  res.json({
    success: true,
    data: watchParty,
  });
});

export const joinWatchParty = asyncHandler(async (req, res) => {
  const { partyId } = req.params;
  const { _id: userId } = req.user;

  const watchParty = await WatchParty.findById(partyId);
  if (!watchParty) {
    throw new AppError('Watch party not found', 404);
  }

  if (watchParty.participants.length >= watchParty.maxParticipants) {
    throw new AppError('Watch party is full', 400);
  }

  // Check if already joined
  const alreadyJoined = watchParty.participants.some(p => 
    p.user.toString() === userId.toString()
  );

  if (alreadyJoined) {
    throw new AppError('Already joined this watch party', 400);
  }

  watchParty.participants.push({ user: userId });
  await watchParty.save();

  // Join the room
  req.io.socketsJoin(`watch-party-${partyId}`);

  // Notify others
  req.io.to(`watch-party-${partyId}`).emit('user-joined', {
    userId,
    user: req.user,
  });

  res.json({
    success: true,
    data: watchParty,
  });
});

export const syncPlayback = asyncHandler(async (req, res) => {
  const { partyId } = req.params;
  const { action, time } = req.body;
  const { _id: userId } = req.user;

  const watchParty = await WatchParty.findById(partyId);
  if (!watchParty) {
    throw new AppError('Watch party not found', 404);
  }

  const isHost = watchParty.host.toString() === userId.toString();

  // Update watch party state
  if (action === 'play') {
    watchParty.isPlaying = true;
    watchParty.currentTime = time;
    watchParty.playTime = new Date();
  } else if (action === 'pause') {
    watchParty.isPlaying = false;
  } else if (action === 'seek') {
    watchParty.currentTime = time;
  }

  await watchParty.save();

  // Broadcast to all participants
  req.io.to(`watch-party-${partyId}`).emit('playback-sync', {
    action,
    time,
    isPlaying: watchParty.isPlaying,
    currentTime: watchParty.currentTime,
    playTime: watchParty.playTime,
    syncedBy: userId,
  });

  res.json({
    success: true,
    data: watchParty,
  });
});

export const sendChatMessage = asyncHandler(async (req, res) => {
  const { partyId } = req.params;
  const { message } = req.body;
  const { _id: userId } = req.user;

  const watchParty = await WatchParty.findById(partyId);
  if (!watchParty) {
    throw new AppError('Watch party not found', 404);
  }

  watchParty.chat.push({
    user: userId,
    message,
  });

  await watchParty.save();

  // Broadcast message
  req.io.to(`watch-party-${partyId}`).emit('new-message', {
    user: req.user,
    message,
    timestamp: new Date(),
  });

  res.json({
    success: true,
    data: watchParty,
  });
});
```

**Frontend - Watch Party Component:**
```jsx
// pages/WatchParty.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import { Play, Pause, Users, MessageSquare, X } from 'lucide-react';

const WatchParty = () => {
  const { partyId } = useParams();
  const [watchParty, setWatchParty] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const [videoElement, setVideoElement] = useState(null);
  const socket = useSocket();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const partyIdRef = useRef(partyId);

  // Fetch watch party details
  useEffect(() => {
    const fetchWatchParty = async () => {
      try {
        const response = await api.get(`/watch-parties/${partyId}`);
        setWatchParty(response.data.data);
        setMessages(response.data.data.chat || []);
        setParticipants(response.data.data.participants || []);
      } catch (err) {
        navigate('/');
      }
    };

    fetchWatchParty();
    partyIdRef.current = partyId;
  }, [partyId, navigate]);

  // Join watch party room
  useEffect(() => {
    if (!socket || !partyId) return;

    socket.emit('join-watch-party', partyId);

    // Listen for playback sync
    socket.on('playback-sync', ({ action, time, isPlaying, currentTime, playTime }) => {
      if (!videoRef.current) return;

      if (action === 'play') {
        videoRef.current.currentTime = time;
        videoRef.current.play().catch(console.error);
      } else if (action === 'pause') {
        videoRef.current.pause();
      } else if (action === 'seek') {
        videoRef.current.currentTime = time;
      }
    });

    // Listen for new messages
    socket.on('new-message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    // Listen for user joined/left
    socket.on('user-joined', (data) => {
      setParticipants(prev => [...prev, data.user]);
    });

    socket.on('user-left', (data) => {
      setParticipants(prev => prev.filter(p => p._id !== data.userId));
    });

    return () => {
      socket.off('playback-sync');
      socket.off('new-message');
      socket.off('user-joined');
      socket.off('user-left');
      socket.emit('leave-watch-party', partyId);
    };
  }, [socket, partyId]);

  // Handle video events
  const handlePlay = () => {
    if (!socket || !watchParty) return;
    
    const video = videoRef.current;
    if (!video) return;

    socket.emit('sync-playback', {
      partyId,
      action: 'play',
      time: video.currentTime,
    });
  };

  const handlePause = () => {
    if (!socket || !watchParty) return;

    socket.emit('sync-playback', {
      partyId,
      action: 'pause',
      time: videoRef.current?.currentTime || 0,
    });
  };

  const handleSeek = () => {
    if (!socket || !watchParty) return;

    socket.emit('sync-playback', {
      partyId,
      action: 'seek',
      time: videoRef.current?.currentTime || 0,
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    try {
      await api.post(`/watch-parties/${partyId}/chat`, {
        message: newMessage,
      });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!watchParty) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
      {/* Video Player */}
      <div className="lg:col-span-3">
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={watchParty.video.videoFile.url}
            poster={watchParty.video.thumbnail.url}
            controls
            onPlay={handlePlay}
            onPause={handlePause}
            onSeeked={handleSeek}
            className="w-full aspect-video"
          />
          
          {/* Watch party overlay */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <Users className="w-4 h-4" />
            <span className="text-white text-sm">
              {participants.length} watching together
            </span>
          </div>
        </div>

        <div className="mt-4">
          <h1 className="text-xl font-bold">{watchParty.video.title}</h1>
          <p className="text-text-secondary mt-1">{watchParty.video.description}</p>
        </div>

        {/* Chat */}
        <div className="mt-6 bg-[var(--color-search-bg)] rounded-lg p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Chat
          </h2>
          
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className="flex items-start gap-3">
                <img
                  src={msg.user?.avatar?.url || '/default-avatar.jpg'}
                  alt={msg.user?.fullName}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-medium text-sm">{msg.user?.fullName}</p>
                  <p className="text-sm text-text-secondary">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send a message..."
              className="flex-1 bg-[var(--color-overlay-hover)] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Participants Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-[var(--color-search-bg)] rounded-lg p-4">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participants ({participants.length})
          </h2>
          
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant._id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-overlay-hover)] transition-colors"
              >
                <img
                  src={participant.avatar?.url || '/default-avatar.jpg'}
                  alt={participant.fullName}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium text-sm">{participant.fullName}</p>
                  <p className="text-xs text-text-secondary">
                    {participant._id === watchParty.host._id && 'Host'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Party Info */}
        <div className="mt-6 bg-[var(--color-search-bg)] rounded-lg p-4">
          <h2 className="font-semibold mb-4">Party Info</h2>
          <p className="text-sm">
            <span className="text-text-secondary">Name:</span> {watchParty.name}
          </p>
          <p className="text-sm mt-2">
            <span className="text-text-secondary">Host:</span> {watchParty.host.fullName}
          </p>
          <p className="text-sm mt-2">
            <span className="text-text-secondary">Started:</span> {formatDate(watchParty.startedAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WatchParty;
```

---

### 2.7 User Preferences & Settings
**What You'll Learn:**
- User settings architecture
- Theme persistence
- Notification preferences
- Accessibility settings

**Implementation:**

**User Model Updates:**
```javascript
// Add to user.model.js
const userSchema = new mongoose.Schema({
  // ... existing fields
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    language: {
      type: String,
      default: 'en',
    },
    notifications: {
      email: {
        likes: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        replies: { type: Boolean, default: true },
        subscriptions: { type: Boolean, default: true },
      },
      push: {
        likes: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        replies: { type: Boolean, default: true },
        subscriptions: { type: Boolean, default: true },
      },
    },
    playback: {
      autoplay: { type: Boolean, default: false },
      quality: {
        type: String,
        enum: ['auto', '1080p', '720p', '480p', '360p'],
        default: 'auto',
      },
      speed: {
        type: Number,
        default: 1,
        min: 0.25,
        max: 2,
      },
    },
    privacy: {
      searchHistory: { type: Boolean, default: true },
      watchHistory: { type: Boolean, default: true },
    },
  },
});
```

**Settings Page:**
```jsx
// pages/Settings.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Moon, Sun, Monitor, Bell, Settings as SettingsIcon, PlayCircle, Shield, Globe, Mail } from 'lucide-react';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const [preferences, setPreferences] = useState(user?.preferences || {});
  const [activeTab, setActiveTab] = useState('appearance');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.preferences) {
      setPreferences(user.preferences);
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await api.post('/users/update-preferences', {
        preferences,
      });
      // Update local user
      await updateProfile({ preferences });
      // Show success
    } catch (err) {
      // Show error
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: <Monitor className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'playback', label: 'Playback', icon: <PlayCircle className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
    { id: 'language', label: 'Language', icon: <Globe className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            Settings
          </h1>
          <p className="text-text-secondary mt-1">
            Manage your account preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-accent text-white'
                  : 'bg-[var(--color-search-bg)] text-text-secondary hover:bg-[var(--color-overlay-hover)] hover:text-text-primary'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-[var(--color-search-bg)] rounded-xl p-6 border border-border-default">
          {activeTab === 'appearance' && (
            <AppearanceSettings
              preferences={preferences}
              setPreferences={setPreferences}
            />
          )}
          
          {activeTab === 'notifications' && (
            <NotificationSettings
              preferences={preferences}
              setPreferences={setPreferences}
            />
          )}
          
          {activeTab === 'playback' && (
            <PlaybackSettings
              preferences={preferences}
              setPreferences={setPreferences}
            />
          )}
          
          {activeTab === 'privacy' && (
            <PrivacySettings
              preferences={preferences}
              setPreferences={setPreferences}
            />
          )}
          
          {activeTab === 'language' && (
            <LanguageSettings
              preferences={preferences}
              setPreferences={setPreferences}
            />
          )}
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors self-end"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

const AppearanceSettings = ({ preferences, setPreferences }) => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold">Theme</h2>
    <p className="text-text-secondary text-sm">
      Choose how Vidora looks on your device
    </p>
    
    <div className="grid grid-cols-3 gap-4">
      <ThemeOption
        value="light"
        label="Light"
        icon={<Sun className="w-5 h-5" />}
        selected={preferences.theme === 'light'}
        onSelect={() => setPreferences(prev => ({ ...prev, theme: 'light' }))}
      />
      <ThemeOption
        value="dark"
        label="Dark"
        icon={<Moon className="w-5 h-5" />}
        selected={preferences.theme === 'dark'}
        onSelect={() => setPreferences(prev => ({ ...prev, theme: 'dark' }))}
      />
      <ThemeOption
        value="system"
        label="System"
        icon={<Monitor className="w-5 h-5" />}
        selected={preferences.theme === 'system'}
        onSelect={() => setPreferences(prev => ({ ...prev, theme: 'system' }))}
      />
    </div>
  </div>
);

const ThemeOption = ({ value, label, icon, selected, onSelect }) => (
  <button
    onClick={onSelect}
    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
      selected
        ? 'bg-accent/10 border border-accent ring-2 ring-accent'
        : 'bg-[var(--color-overlay-hover)] hover:bg-[var(--color-overlay-hover)]/80'
    }`}
  >
    <span className={`p-2 rounded-lg ${
      selected ? 'bg-accent text-white' : 'bg-[var(--color-search-bg)]'
    }`}>
      {icon}
    </span>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const NotificationSettings = ({ preferences, setPreferences }) => {
  const toggleNotification = (type, channel) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [channel]: {
          ...prev.notifications?.[channel],
          [type]: !prev.notifications?.[channel]?.[type],
        },
      },
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Notification Preferences</h2>
      <p className="text-text-secondary text-sm">
        Choose which notifications you want to receive
      </p>

      <div className="space-y-4">
        <NotificationSection
          title="Email Notifications"
          icon={<Mail className="w-5 h-5" />}
          preferences={preferences.notifications?.email || {}}
          onToggle={(type) => toggleNotification(type, 'email')}
        />
        
        <NotificationSection
          title="Push Notifications"
          icon={<Bell className="w-5 h-5" />}
          preferences={preferences.notifications?.push || {}}
          onToggle={(type) => toggleNotification(type, 'push')}
        />
      </div>
    </div>
  );
};

const NotificationSection = ({ title, icon, preferences, onToggle }) => (
  <div className="bg-[var(--color-overlay-hover)] rounded-lg p-4">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="font-medium">{title}</h3>
    </div>
    
    <div className="space-y-3">
      {['likes', 'comments', 'replies', 'subscriptions'].map(type => (
        <ToggleOption
          key={type}
          label={capitalizeFirst(type)}
          value={preferences[type] || false}
          onToggle={() => onToggle(type)}
        />
      ))}
    </div>
  </div>
);

const PlaybackSettings = ({ preferences, setPreferences }) => {
  const playback = preferences.playback || {};

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Playback Settings</h2>
      
      <div className="space-y-4">
        <ToggleOption
          label="Autoplay next video"
          value={playback.autoplay || false}
          onToggle={() => setPreferences(prev => ({
            ...prev,
            playback: { ...prev.playback, autoplay: !prev.playback?.autoplay }
          }))}
        />

        <SelectOption
          label="Default Video Quality"
          value={playback.quality || 'auto'}
          options={[
            { value: 'auto', label: 'Auto' },
            { value: '1080p', label: '1080p HD' },
            { value: '720p', label: '720p HD' },
            { value: '480p', label: '480p SD' },
            { value: '360p', label: '360p Low' },
          ]}
          onChange={(value) => setPreferences(prev => ({
            ...prev,
            playback: { ...prev.playback, quality: value }
          }))}
        />

        <SelectOption
          label="Playback Speed"
          value={playback.speed || 1}
          options={[
            { value: 0.25, label: '0.25x' },
            { value: 0.5, label: '0.5x' },
            { value: 0.75, label: '0.75x' },
            { value: 1, label: 'Normal (1x)' },
            { value: 1.25, label: '1.25x' },
            { value: 1.5, label: '1.5x' },
            { value: 2, label: '2x' },
          ]}
          onChange={(value) => setPreferences(prev => ({
            ...prev,
            playback: { ...prev.playback, speed: Number(value) }
          }))}
        />
      </div>
    </div>
  );
};

// Helper components
const ToggleOption = ({ label, value, onToggle }) => (
  <button
    onClick={onToggle}
    className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-[var(--color-overlay-hover)] transition-colors"
  >
    <span className="font-medium">{label}</span>
    <div className={`w-12 h-6 rounded-full relative transition-all ${
      value ? 'bg-accent' : 'bg-[var(--color-overlay-hover)]'
    }`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
        value ? 'translate-x-6' : 'translate-x-0'
      }`} />
    </div>
  </button>
);

const SelectOption = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 rounded-lg bg-[var(--color-overlay-hover)] hover:bg-[var(--color-overlay-hover)]/80 transition-colors"
      >
        <span className="font-medium">{label}</span>
        <span className="text-text-secondary">{selectedOption.label}</span>
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-search-bg)] border border-border-default rounded-lg shadow-lg overflow-hidden z-10">
          {options.map(option => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-[var(--color-overlay-hover)] transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const PrivacySettings = ({ preferences, setPreferences }) => {
  const privacy = preferences.privacy || {};

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Privacy Settings</h2>
      <p className="text-text-secondary text-sm">
        Control what data is saved about your activity
      </p>

      <div className="space-y-4">
        <ToggleOption
          label="Save search history"
          value={privacy.searchHistory !== false}
          onToggle={() => setPreferences(prev => ({
            ...prev,
            privacy: { ...prev.privacy, searchHistory: !prev.privacy?.searchHistory }
          }))}
        />
        <ToggleOption
          label="Save watch history"
          value={privacy.watchHistory !== false}
          onToggle={() => setPreferences(prev => ({
            ...prev,
            privacy: { ...prev.privacy, watchHistory: !prev.privacy?.watchHistory }
          }))}
        />
      </div>
    </div>
  );
};

const LanguageSettings = ({ preferences, setPreferences }) => (
  <div className="space-y-6">
    <h2 className="text-lg font-semibold">Language</h2>
    <p className="text-text-secondary text-sm">
      Select your preferred language
    </p>

    <SelectOption
      label="Language"
      value={preferences.language || 'en'}
      options={[
        { value: 'en', label: 'English' },
        { value: 'es', label: 'Español' },
        { value: 'fr', label: 'Français' },
        { value: 'de', label: 'Deutsch' },
        { value: 'hi', label: 'हिन्दी' },
        { value: 'ar', label: 'العربية' },
      ]}
      onChange={(value) => setPreferences(prev => ({
        ...prev,
        language: value,
      }))}
    />
  </div>
);

// Helper function
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default Settings;
```

---

# 🌟 PHASE 3: ADVANCED TOPICS & PRODUCTION READINESS (Weeks 7-10)

## 3.1 Testing Strategy
**What You'll Learn:**
- Unit testing (Jest)
- Integration testing
- End-to-end testing (Cypress/Playwright)
- Test coverage and mocking

**Implementation:**

**Backend Testing:**
```javascript
// __tests__/user.controller.test.js
import { User } from '../models/user.model.js';
import { registerUser, loginUser } from '../controllers/user.controller.js';
import { mockRequest, mockResponse } from '../utils/testUtils.js';

describe('User Controller', () => {
  beforeAll(async () => {
    await User.deleteMany({});
  });

  describe('registerUser', () => {
    it('should register a new user with valid data', async () => {
      const req = mockRequest({
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
        },
      });
      const res = mockResponse();

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );

      // Verify user was created
      const user = await User.findOne({ username: 'testuser' });
      expect(user).toBeTruthy();
    });

    it('should return 400 for missing required fields', async () => {
      const req = mockRequest({
        body: {
          username: 'testuser',
          // Missing email, password, fullName
        },
      });
      const res = mockResponse();

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it('should return 400 for duplicate username', async () => {
      // Create existing user
      await User.create({
        username: 'duplicate',
        email: 'dup@example.com',
        password: 'password123',
        fullName: 'Duplicate User',
      });

      const req = mockRequest({
        body: {
          username: 'duplicate',
          email: 'new@example.com',
          password: 'password123',
          fullName: 'New User',
        },
      });
      const res = mockResponse();

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

// utils/testUtils.js
export const mockRequest = (overrides = {}) => ({
  body: {},
  params: {},
  query: {},
  user: null,
  ...overrides,
});

export const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnValue(res),
    json: jest.fn().mockReturnValue(res),
    send: jest.fn().mockReturnValue(res),
    cookie: jest.fn().mockReturnValue(res),
    clearCookie: jest.fn().mockReturnValue(res),
  };
  return res;
};
```

**Frontend Testing:**
```javascript
// Install: npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

// src/__tests__/Login.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { Login } from '../pages/Login';
import api from '../services/api';

// Mock API
jest.mock('../services/api');

const renderWithProviders = (component) => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    api.post.mockReset();
  });

  it('renders login form', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    api.post.mockResolvedValue({
      data: {
        success: true,
        data: {
          accessToken: 'test-token',
          user: { _id: '1', username: 'testuser', email: 'test@example.com' },
        },
      },
    });

    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email or username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/users/login', {
        identifier: 'testuser',
        password: 'password123',
      });
    });
  });

  it('shows validation errors', async () => {
    renderWithProviders(<Login />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Email or username is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });
});
```

**E2E Testing with Cypress:**
```javascript
// cypress/e2e/login.cy.js
describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should load login page', () => {
    cy.contains('Welcome back').should('be.visible');
    cy.get('input[name="identifier"]').should('exist');
    cy.get('input[name="password"]').should('exist');
  });

  it('should show validation errors on empty submit', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Email or username is required').should('be.visible');
    cy.contains('Password is required').should('be.visible');
  });

  it('should login with valid credentials', () => {
    cy.intercept('POST', '/api/v1/users/login').as('loginRequest');

    cy.get('input[name="identifier"]').type('testuser');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        identifier: 'testuser',
        password: 'password123',
      });
    });

    cy.url().should('include', '/');
  });
});
```

---

## 3.2 CI/CD Pipeline
**What You'll Learn:**
- GitHub Actions workflows
- Automated testing
- Docker containerization
- Deployment automation

**Implementation:**

**.github/workflows/ci-cd.yml:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install backend dependencies
      working-directory: backend
      run: npm ci

    - name: Install frontend dependencies
      working-directory: frontend
      run: npm ci

    - name: Run backend tests
      working-directory: backend
      run: npm test
      env:
        NODE_ENV: test
        MONGODB_URI: ${{ secrets.MONGODB_TEST_URI }}
        JWT_ACCESS_TOKEN_SECRET: test-secret
        JWT_REFRESH_TOKEN_SECRET: test-secret-refresh

    - name: Run frontend tests
      working-directory: frontend
      run: npm test

    - name: Run ESLint
      working-directory: frontend
      run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 20.x
        cache: 'npm'

    - name: Install dependencies
      working-directory: backend
      run: npm ci

    - name: Build frontend
      working-directory: frontend
      run: npm run build

    - name: Upload frontend build
      uses: actions/upload-artifact@v4
      with:
        name: frontend-build
        path: frontend/dist

    - name: Deploy to staging
      if: github.ref == 'refs/heads/develop'
      run: |
        echo "Deploying to staging..."
        # Add your deployment commands here
      env:
        DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
    - name: Download frontend build
      uses: actions/download-artifact@v4
      with:
        name: frontend-build
        path: frontend/dist

    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # Add your production deployment commands
      env:
        DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
        PRODUCTION_DB_URI: ${{ secrets.PRODUCTION_DB_URI }}
```

**Docker Setup:**
```dockerfile
# Dockerfile for backend
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8000

CMD ["node", "src/index.js"]
```

```dockerfile
# Dockerfile for frontend
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/vidora
      - JWT_ACCESS_TOKEN_SECRET=${JWT_ACCESS_TOKEN_SECRET}
      - JWT_REFRESH_TOKEN_SECRET=${JWT_REFRESH_TOKEN_SECRET}
      - CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
      - CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
      - CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
      - CORS_ORIGIN=http://localhost:5173
    depends_on:
      - mongo

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:80"
    environment:
      - VITE_API_BASE_URL=http://backend:8000/api/v1
    depends_on:
      - backend

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=vidora

volumes:
  mongo_data:
```

---

## 3.3 Performance Monitoring
**What You'll Learn:**
- Application performance monitoring
- Error tracking
- User analytics
- Performance optimization insights

**Implementation:**

**Frontend - Sentry Integration:**
```javascript
// Install: npm install @sentry/react @sentry/vite-plugin

// vite.config.js
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  build: {
    sourcemap: true,
  },
});

// main.jsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: [
    'localhost',
    /^\/api\/v1\//,
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Backend - Application Insights:**
```javascript
// Install: npm install @microsoft/applicationinsights
import { ApplicationInsights } from '@microsoft/applicationinsights';

const appInsights = new ApplicationInsights({
  config: {
    applicationInsights: {
      connectionString: process.env.APPINSIGHTS_CONNECTION_STRING,
    },
  },
});

// Start monitoring
appInsights.loadAppInsights();

// Track requests
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    appInsights.defaultClient.trackRequest({
      name: `${req.method} ${req.path}`,
      url: req.url,
      duration,
      resultCode: res.statusCode,
      success: res.statusCode < 400,
    });
  });
  
  next();
});

// Track exceptions
process.on('unhandledRejection', (reason, promise) => {
  appInsights.defaultClient.trackException({
    exception: new Error(`Unhandled Rejection: ${reason}`),
  });
});

process.on('uncaughtException', (error) => {
  appInsights.defaultClient.trackException({
    exception: error,
  });
  process.exit(1);
});
```

---

## 3.4 Accessibility Audit
**What You'll Learn:**
- WCAG compliance
- Screen reader testing
- Keyboard navigation
- Color contrast analysis

**Implementation:**

**AXE Core Integration:**
```javascript
// Install: npm install axe-core @axe-core/react

// src/providers/A11yProvider.jsx
import { useEffect } from 'react';
import { configureAxe } from '@axe-core/react';

export const A11yProvider = ({ children }) => {
  useEffect(() => {
    if (import.meta.env.PROD) {
      configureAxe({
        // Run in production
        runInProduction: true,
        // Only report violations (don't break the app)
        reportViolations: (violations) => {
          if (violations.length > 0) {
            console.warn('Accessibility violations found:', violations);
            // Send to monitoring service
            if (window.Sentry) {
              window.Sentry.captureException(new Error('A11y violations'), {
                extra: { violations },
              });
            }
          }
        },
      });
    }
  }, []);

  return children;
};

// main.jsx
import { A11yProvider } from './providers/A11yProvider';

root.render(
  <React.StrictMode>
    <A11yProvider>
      <App />
    </A11yProvider>
  </React.StrictMode>
);
```

**Accessibility Improvements Checklist:**

1. **Keyboard Navigation:**
   - All interactive elements focusable
   - Logical tab order
   - Visible focus indicators
   - Skip links for content

2. **Screen Reader Support:**
   - ARIA labels and roles
   - Semantic HTML elements
   - Alt text for images
   - Live regions for dynamic content

3. **Color & Contrast:**
   - Minimum 4.5:1 contrast ratio
   - No color-only information
   - Dark mode support
   - High contrast mode support

4. **Form Accessibility:**
   - Proper labels for all inputs
   - Error messages linked to fields
   - Required field indicators
   - Form validation feedback

**Example Accessible Component:**
```jsx
// components/ui/AccessibleButton.jsx
import { forwardRef } from 'react';

const AccessibleButton = forwardRef((
  {
    children,
    onClick,
    disabled = false,
    ariaLabel,
    type = 'button',
    className = '',
    ...props
  },
  ref
) => {
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-disabled={disabled}
      className={`focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
```

---

## 3.5 Internationalization (i18n)
**What You'll Learn:**
- Translation management
- Locale detection
- Date/number formatting
- Right-to-left support

**Implementation:**

**Installation:**
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

**Setup:**
```javascript
// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const loadTranslations = async (lng) => {
  // Load translations from API or local files
  const response = await import(`./locales/${lng}/translation.json`);
  return response.default;
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['querystring', 'navigator', 'localStorage', 'htmlTag'],
      caches: ['localStorage'],
      lookupQuerystring: 'lng',
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n;
```

**Language Switcher Component:**
```jsx
// components/layout/LanguageSwitcher.jsx
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', rtl: true },
];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--color-overlay-hover)] transition-colors"
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm">
          {languages.find(l => l.code === i18n.language)?.flag}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--color-search-bg)] border border-border-default rounded-lg shadow-lg overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className="w-full px-4 py-2 text-left hover:bg-[var(--color-overlay-hover)] transition-colors flex items-center gap-2"
              dir={lang.rtl ? 'rtl' : 'ltr'}
            >
              <span>{lang.flag}</span>
              <span className="flex-1">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```

**Translation Files:**
```json
// src/i18n/locales/en/translation.json
{
  "welcome": "Welcome",
  "home": "Home",
  "videos": "Videos",
  "search": "Search",
  "login": "Sign In",
  "register": "Sign Up",
  "logout": "Sign Out",
  "settings": "Settings",
  "profile": "Profile",
  "like": "Like",
  "dislike": "Dislike",
  "comment": "Comment",
  "subscribe": "Subscribe",
  "subscribed": "Subscribed",
  "views": "{{count}} views",
  "ago": "{{time}} ago",
  "validation": {
    "required": "This field is required",
    "email": "Please enter a valid email",
    "password": {
      "min": "Password must be at least 8 characters",
      "max": "Password must be at most 100 characters"
    }
  }
}
```

**Using Translations:**
```jsx
// pages/Home.jsx
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('videos', { count: 10 })}</p>
    </div>
  );
};
```

---

## 3.6 Progressive Web App (PWA)
**What You'll Learn:**
- Service workers
- Cache strategies
- Offline support
- App manifest
- Push notifications

**Implementation:**

**Vite PWA Plugin:**
```bash
npm install vite-plugin-pwa
```

**vite.config.js:**
```javascript
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Vidora',
        short_name: 'Vidora',
        description: 'Video sharing platform',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'videos',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
              },
            },
          },
          {
            urlPattern: /\/api\/v1\/videos\?.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'videos-api',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
        ],
      },
    }),
  ],
});
```

**Service Worker Customization:**
```javascript
// public/sw.js
const CACHE_NAME = 'vidora-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  // Add more assets to cache
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise fetch and cache
        return fetch(event.request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  const title = data?.title || 'Vidora';
  const options = {
    body: data?.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: {
      url: data?.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data.url) {
    clients.openWindow(event.notification.data.url);
  }
});
```

**Push Notification Support:**
```javascript
// frontend/src/utils/notifications.js
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

let serviceWorkerRegistration = null;

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      serviceWorkerRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
      
      // Request notification permission
      await requestNotificationPermission();
    } catch (err) {
      console.error('Service Worker registration failed:', err);
    }
  }
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    return false;
  }

  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    console.log('Notification permission granted');
    await subscribeToPushNotifications();
    return true;
  }
  
  return false;
};

export const subscribeToPushNotifications = async () => {
  if (!serviceWorkerRegistration) {
    await registerServiceWorker();
  }

  if (!serviceWorkerRegistration) {
    return null;
  }

  try {
    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    // Send subscription to server
    await api.post('/notifications/subscribe', {
      subscription,
    });

    return subscription;
  } catch (err) {
    console.error('Failed to subscribe to push notifications:', err);
    return null;
  }
};

export const showLocalNotification = (title, options) => {
  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options);
    });
  }
};

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
```

---

## 3.7 Security Advanced
**What You'll Learn:**
- Rate limiting per user
- IP-based restrictions
- Content moderation
- Two-factor authentication

**Implementation:**

**Rate Limiting with Redis:**
```javascript
// Install: npm install express-rate-limit redis ioredis
import rateLimit from 'express-rate-limit';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis error:', err));

const redisLimiter = rateLimit({
  store: new RateLimitStoreRedis({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later',
});

// Apply to API routes
app.use('/api/v1/', redisLimiter);
```

**Two-Factor Authentication:**
```javascript
// Install: npm install otplib speakeasy qrcode
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

// In user controller
export const setupTwoFactor = asyncHandler(async (req, res) => {
  const { _id: userId } = req.user;

  // Generate secret
  const secret = authenticator.generateSecret();

  // Generate QR code
  const otpAuthUrl = authenticator.keyuri(
    userId.toString(),
    'Vidora',
    secret
  );

  const qrCode = await QRCode.toDataURL(otpAuthUrl);

  // Save secret temporarily (store in user document)
  const user = await User.findByIdAndUpdate(
    userId,
    { twoFactorSecret: secret },
    { new: true }
  );

  res.json({
    success: true,
    data: {
      qrCode,
      secret,
    },
  });
});

export const enableTwoFactor = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const { _id: userId } = req.user;

  const user = await User.findById(userId);

  // Verify code
  const isValid = authenticator.verify({
    token: code,
    secret: user.twoFactorSecret,
  });

  if (!isValid) {
    throw new AppError('Invalid verification code', 400);
  }

  // Enable 2FA
  user.twoFactorEnabled = true;
  await user.save();

  res.json({
    success: true,
    message: 'Two-factor authentication enabled',
  });
});

export const loginWithTwoFactor = asyncHandler(async (req, res) => {
  const { identifier, password, code } = req.body;

  // First verify credentials
  const user = await User.findOne({
    $or: [{ username: identifier }, { email: identifier }],
  });

  if (!user) {
    throw new AuthError('Invalid credentials');
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new AuthError('Invalid credentials');
  }

  // Check if 2FA is enabled
  if (user.twoFactorEnabled) {
    if (!code) {
      // Return temporary token for 2FA verification
      const tempToken = user.GenerateTempToken();
      return res.json({
        success: true,
        requires2FA: true,
        tempToken,
      });
    }

    // Verify 2FA code
    const isValidCode = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValidCode) {
      throw new AuthError('Invalid two-factor code');
    }
  }

  // Generate tokens
  const accessToken = user.GenerateAccessToken();
  const refreshToken = user.GenerateRefreshToken();

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatar: user.avatar,
      },
    },
  });
});
```

---

## 3.8 Content Moderation
**What You'll Learn:**
- Automated content filtering
- User reporting system
- Moderation dashboard
- Profanity filtering

**Implementation:**

**Profanity Filter:**
```javascript
// Install: npm install profanity-filter
import { ProfanityFilter } from 'profanity-filter';

const filter = new ProfanityFilter({
  customWords: ['badword1', 'badword2'],
});

// Middleware for comment moderation
const moderateContent = (req, res, next) => {
  if (req.body.text) {
    const isProfane = filter.isProfane(req.body.text);
    if (isProfane) {
      return res.status(400).json({
        success: false,
        message: 'Content contains inappropriate language',
      });
    }
  }
  next();
};

// In comment routes
app.post('/comments/:videoId', authMiddleware, moderateContent, createComment);
```

**Report System:**
```javascript
// models/report.model.js
import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reportedContent: {
    type: {
      type: String,
      enum: ['video', 'comment', 'user', 'playlist'],
      required: true,
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  reason: {
    type: String,
    enum: [
      'spam',
      'inappropriate',
      'harassment',
      'copyright',
      'violence',
      'misinformation',
      'other',
    ],
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  actionTaken: {
    type: String,
    enum: ['none', 'removed', 'warned', 'banned'],
  },
}, { timestamps: true });

reportSchema.index({ status: 1, createdAt: -1 });

export const Report = mongoose.model('Report', reportSchema);
```

**Report Controller:**
```javascript
// controllers/report.controller.js
export const createReport = asyncHandler(async (req, res) => {
  const { contentType, contentId, reason, description } = req.body;
  const { _id: reporterId } = req.user;

  // Check if already reported
  const existingReport = await Report.findOne({
    reporter: reporterId,
    'reportedContent.type': contentType,
    'reportedContent.id': contentId,
  });

  if (existingReport) {
    throw new AppError('You have already reported this content', 400);
  }

  // Create report
  const report = new Report({
    reporter: reporterId,
    reportedContent: {
      type: contentType,
      id: contentId,
    },
    reason,
    description,
  });

  await report.save();

  // Notify moderators (via WebSocket or email)
  if (global.io) {
    global.io.to('moderators').emit('new-report', {
      report,
    });
  }

  res.json({
    success: true,
    message: 'Report submitted successfully',
    data: report,
  });
});

export const getReports = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;

  const [reports, total] = await Promise.all([
    Report.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('reporter', 'username fullName avatar')
      .populate('reviewedBy', 'username fullName'),
    Report.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: reports,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  });
});

export const updateReportStatus = asyncHandler(async (req, res) => {
  const { reportId } = req.params;
  const { status, actionTaken } = req.body;
  const { _id: moderatorId } = req.user;

  // Check if user is moderator
  const user = await User.findById(moderatorId);
  if (!user || !user.isModerator) {
    throw new ForbiddenError('Only moderators can update report status');
  }

  const report = await Report.findByIdAndUpdate(
    reportId,
    {
      status,
      reviewedBy: moderatorId,
      reviewedAt: new Date(),
      actionTaken,
    },
    { new: true }
  );

  if (!report) {
    throw new AppError('Report not found', 404);
  }

  // Take action based on report
  if (actionTaken === 'removed') {
    await handleContentRemoval(report);
  } else if (actionTaken === 'banned') {
    await handleUserBan(report);
  }

  res.json({
    success: true,
    data: report,
  });
});

async function handleContentRemoval(report) {
  const { type, id } = report.reportedContent;

  switch (type) {
    case 'video':
      await Video.findByIdAndUpdate(id, { isPublished: false });
      break;
    case 'comment':
      await Comment.findByIdAndDelete(id);
      break;
    case 'playlist':
      await Playlist.findByIdAndDelete(id);
      break;
  }
}

async function handleUserBan(report) {
  const { type, id } = report.reportedContent;
  
  if (type === 'user') {
    await User.findByIdAndUpdate(id, {
      isBanned: true,
      bannedAt: new Date(),
      bannedBy: report.reviewedBy,
      banReason: report.reason,
    });
  } else if (type === 'video') {
    const video = await Video.findById(id);
    if (video) {
      await User.findByIdAndUpdate(video.owner, {
        isBanned: true,
        bannedAt: new Date(),
        bannedBy: report.reviewedBy,
        banReason: report.reason,
      });
    }
  }
}
```

---

## 3.9 Subscription & Payment (Stripe)
**What You'll Learn:**
- Payment gateway integration
- Subscription management
- Webhook handling
- Recurring billing

**Implementation:**

**Stripe Setup:**
```javascript
// Install: npm install stripe
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});
```

**Subscription Model:**
```javascript
// models/subscription.model.js (update existing)
import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  subscriber: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  channel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stripeSubscriptionId: {
    type: String,
    default: '',
  },
  stripeCustomerId: {
    type: String,
    default: '',
  },
  plan: {
    type: String,
    enum: ['free', 'premium', 'creator'],
    default: 'free',
  },
  status: {
    type: String,
    enum: ['active', 'canceled', 'past_due', 'unpaid', 'trialing'],
    default: 'active',
  },
  currentPeriodEnd: {
    type: Date,
  },
  trialEnd: {
    type: Date,
  },
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

subscriptionSchema.index({ subscriber: 1, channel: 1 }, { unique: true });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
```

**Payment Controller:**
```javascript
// controllers/payment.controller.js
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { plan, channelId } = req.body;
  const { _id: userId } = req.user;

  // Get channel
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new AppError('Channel not found', 404);
  }

  // Create or get Stripe customer
  let customer;
  const existingUser = await User.findById(userId);
  
  if (existingUser.stripeCustomerId) {
    customer = await stripe.customers.retrieve(existingUser.stripeCustomerId);
  } else {
    customer = await stripe.customers.create({
      email: req.user.email,
      name: req.user.fullName,
      metadata: {
        userId: userId.toString(),
      },
    });

    // Update user with customer ID
    await User.findByIdAndUpdate(userId, {
      stripeCustomerId: customer.id,
    });
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: getPlanAmount(plan),
    currency: 'usd',
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      userId: userId.toString(),
      channelId: channelId.toString(),
      plan,
    },
  });

  res.json({
    success: true,
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    },
  });
});

export const createSubscription = asyncHandler(async (req, res) => {
  const { paymentMethodId, plan, channelId } = req.body;
  const { _id: userId } = req.user;

  // Get channel
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new AppError('Channel not found', 404);
  }

  // Get or create customer
  let customer = await stripe.customers.retrieve(req.user.stripeCustomerId);
  
  // Attach payment method to customer
  await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customer.id,
  });

  // Update customer default payment method
  await stripe.customers.update(customer.id, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: getPlanPriceId(plan) }],
    metadata: {
      userId: userId.toString(),
      channelId: channelId.toString(),
      plan,
    },
  });

  // Save subscription to database
  const newSubscription = new Subscription({
    subscriber: userId,
    channel: channelId,
    stripeSubscriptionId: subscription.id,
    stripeCustomerId: customer.id,
    plan,
    status: subscription.status,
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
  });

  await newSubscription.save();

  res.json({
    success: true,
    data: {
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    },
  });
});

export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handleSubscriptionPayment(event.data.object);
      break;
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

async function handlePaymentSuccess(paymentIntent) {
  const { userId, channelId, plan } = paymentIntent.metadata;

  // Create subscription
  const subscription = new Subscription({
    subscriber: userId,
    channel: channelId,
    stripeSubscriptionId: paymentIntent.subscription,
    stripeCustomerId: paymentIntent.customer,
    plan,
    status: 'active',
    currentPeriodEnd: new Date(paymentIntent.created * 1000),
  });

  await subscription.save();
}

async function handleSubscriptionCreated(subscription) {
  const { userId, channelId, plan } = subscription.metadata;

  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    },
    { upsert: true, new: true }
  );
}

async function handleSubscriptionUpdated(subscription) {
  await Subscription.findOneAndUpdate(
    { stripeSubscriptionId: subscription.id },
    {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    }
  );
}

async function handleSubscriptionDeleted(subscription) {
  await Subscription.findOneAndDelete({
    stripeSubscriptionId: subscription.id,
  });
}

function getPlanAmount(plan) {
  const amounts = {
    premium: 999, // $9.99
    creator: 2999, // $29.99
  };
  return amounts[plan] || 0;
}

function getPlanPriceId(plan) {
  const priceIds = {
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
    creator: process.env.STRIPE_CREATOR_PRICE_ID,
  };
  return priceIds[plan];
}
```

**Frontend Payment Component:**
```jsx
// components/subscriptions/PremiumCheckout.jsx
import { useState, useEffect } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Check, X, Load2 } from 'lucide-react';

const PremiumCheckout = ({ channel, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [plan, setPlan] = useState('premium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);

  const plans = [
    {
      id: 'premium',
      name: 'Premium',
      price: '$9.99/month',
      features: [
        'Ad-free experience',
        'Early access to videos',
        'Exclusive content',
        'Support creator directly',
      ],
    },
    {
      id: 'creator',
      name: 'Creator Pro',
      price: '$29.99/month',
      features: [
        'All Premium features',
        'Advanced analytics',
        'Custom branding',
        'Priority support',
      ],
    },
  ];

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        const response = await api.post('/payments/create-intent', {
          plan,
          channelId: channel._id,
        });
        
        setClientSecret(response.data.data.clientSecret);
      } catch (err) {
        setError('Failed to create payment intent');
      }
    };

    createPaymentIntent();
  }, [plan, channel._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (error) {
        setError(error.message);
      } else if (paymentIntent.status === 'succeeded') {
        // Create subscription
        const response = await api.post('/payments/create-subscription', {
          paymentMethodId: paymentIntent.payment_method,
          plan,
          channelId: channel._id,
        });

        if (response.data.success) {
          onSuccess();
        } else {
          setError('Payment succeeded but subscription failed');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlan = plans.find(p => p.id === plan);

  return (
    <div className="max-w-md mx-auto bg-[var(--color-search-bg)] rounded-xl p-6 border border-border-default">
      <h2 className="text-xl font-bold mb-4">Support {channel.fullName}</h2>

      {/* Plan Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {plans.map(p => (
          <button
            key={p.id}
            onClick={() => setPlan(p.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              plan === p.id
                ? 'border-accent bg-accent/10'
                : 'border-border-default hover:border-accent/50'
            }`}
          >
            <p className="font-semibold">{p.name}</p>
            <p className="text-lg font-bold mt-1">{p.price}</p>
            <ul className="mt-3 space-y-1 text-sm">
              {p.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-white p-3 rounded-lg border border-border-default">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#333',
                  '::placeholder': {
                    color: '#aaa',
                  },
                },
                invalid: {
                  color: '#ef4444',
                },
              },
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Load2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Subscribe for ${selectedPlan.price}`
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default PremiumCheckout;
```

---

# 🏆 FINAL DELIVERABLES & MILESTONES

## Milestone 1: Foundation (2 Weeks)
- [ ] TypeScript migration for backend
- [ ] Input validation with Zod
- [ ] Security hardening (Helmet, CORS, rate limiting)
- [ ] Error handling system
- [ ] API documentation (Swagger)
- [ ] TypeScript migration for frontend
- [ ] React Query integration
- [ ] Performance optimizations (memo, lazy loading)
- [ ] Environment configuration
- [ ] Logging system

## Milestone 2: New Features (4 Weeks)
- [ ] WebSocket implementation for real-time features
- [ ] Advanced search & filtering
- [ ] Notifications system
- [ ] Analytics dashboard
- [ ] Playlist enhancements (drag & drop, privacy)
- [ ] Watch parties (real-time collaboration)
- [ ] User preferences & settings

## Milestone 3: Production Readiness (4 Weeks)
- [ ] Testing strategy (unit, integration, E2E)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Performance monitoring (Sentry, App Insights)
- [ ] Accessibility audit
- [ ] Internationalization (i18n)
- [ ] Progressive Web App (PWA)
- [ ] Advanced security (2FA, rate limiting)
- [ ] Content moderation system
- [ ] Subscription & payment (Stripe)

---

# 📚 LEARNING RESOURCES

## Backend Development
1. **Node.js Best Practices**
   - [Node.js Design Patterns](https://www.nodejsdesignpatterns.com/)
   - [The 12 Factor App](https://12factor.net/)
   - [OWASP Security Guidelines](https://owasp.org/)

2. **Express.js Advanced**
   - [Express.js Advanced Guide](https://expressjs.com/en/advanced/)
   - [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

3. **MongoDB**
   - [MongoDB University](https://university.mongodb.com/)
   - [MongoDB Aggregation Framework](https://www.mongodb.com/docs/manual/aggregation/)
   - [Mongoose Documentation](https://mongoosejs.com/docs/)

4. **Authentication**
   - [JWT Best Practices](https://auth0.com/blog/ten-things-you-should-know-about-tokens-and-json-web-tokens/)
   - [OAuth 2.0 Guide](https://oauth.net/2/)

## Frontend Development
1. **React Advanced**
   - [React Docs](https://react.dev/learn)
   - [React Patterns](https://reactpatterns.com/)
   - [Advanced React by Kent C. Dodds](https://kentcdodds.com/blog/)

2. **TypeScript**
   - [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
   - [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
   - [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

3. **State Management**
   - [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
   - [Zustand Docs](https://docs.pmnd.rs/zustand/)
   - [Redux Toolkit](https://redux-toolkit.js.org/)

4. **UI/UX**
   - [Tailwind CSS Docs](https://tailwindcss.com/docs)
   - [Framer Motion Docs](https://www.framer.com/motion/)
   - [Accessibility Fundamentals](https://www.a11yproject.com/checklist/)

## DevOps
1. **Docker**
   - [Docker Documentation](https://docs.docker.com/)
   - [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

2. **CI/CD**
   - [GitHub Actions Docs](https://docs.github.com/en/actions)
   - [CI/CD Best Practices](https://about.gitlab.com/blog/2021/05/21/ci-cd-pipeline-best-practices/)

3. **Monitoring**
   - [Sentry Documentation](https://docs.sentry.io/)
   - [Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview)

## Architecture
1. **System Design**
   - [Grokking the System Design Interview](https://www.educative.io/courses/grokking-the-system-design-interview)
   - [System Design Primer](https://github.com/donnemartin/system-design-primer)

2. **Scalability**
   - [Designing Data-Intensive Applications](https://dataintensive.net/)
   - [The Art of Scalability](https://www.amazon.com/Art-Scalability-Scalable-Architectures-You/dp/0137146010)

---

# 🎯 NEXT STEPS

## Immediate Actions (Start Today)

1. **Set up development environment**
   ```bash
   # Clone the repository
   git clone https://github.com/SaimRaza885/Vidora.git
   cd Vidora
   
   # Install dependencies
   cd backend && npm install
   cd ../frontend && npm install
   
   # Start services
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

2. **Create GitHub repository**
   - Create a new repository for your improved version
   - Set up branches: main, develop, feature/*
   - Configure branch protection rules

3. **Set up project management**
   - Create GitHub Projects or use Trello/Asana
   - Track progress with this roadmap
   - Set weekly goals

## First Week Focus

**Day 1-2: TypeScript Migration**
- Convert 3-5 backend files to TypeScript
- Set up type definitions for models
- Learn TypeScript generics and utility types

**Day 3-4: Validation & Security**
- Implement Zod validation for all routes
- Add Helmet and rate limiting
- Set up input sanitization

**Day 5-7: Frontend Architecture**
- Convert 3-5 frontend files to TypeScript
- Set up React Query for data fetching
- Implement component patterns

---

# 💡 PRO TIPS

## 1. Code Quality
- **Always write tests** for new features
- **Use meaningful commit messages** (follow Conventional Commits)
- **Keep functions small** (max 20 lines)
- **Follow the Boy Scout Rule**: Leave the code better than you found it
- **Document your decisions** in ADR (Architecture Decision Records)

## 2. Performance
- **Measure before optimizing**: Use Chrome DevTools, Lighthouse
- **Lazy load** heavy components and routes
- **Memoize** expensive calculations
- **Debounce** search inputs and rapid-fire events
- **Use efficient data structures** (Map, Set for lookups)

## 3. Security
- **Never trust user input**: Validate, sanitize, escape
- **Use parameterized queries**: Prevent NoSQL injection
- **Secure sensitive data**: Encrypt at rest and in transit
- **Principle of least privilege**: Limit permissions
- **Keep dependencies updated**: Use dependabot

## 4. User Experience
- **Always provide feedback**: Loading states, success/error messages
- **Make it accessible**: Keyboard navigation, ARIA labels
- **Handle errors gracefully**: Don't crash, show helpful messages
- **Optimize for mobile**: Touch targets, responsive layouts
- **Respect user preferences**: Theme, language, notifications

## 5. Learning Strategy
- **Learn by doing**: Implement, break, fix, improve
- **Read code**: Study popular open-source projects
- **Write tests**: Tests force you to understand the code
- **Teach others**: Explain concepts to solidify understanding
- **Stay curious**: Ask "why" and "how can this be better?"

---

# 🎉 CONCLUSION

By following this comprehensive roadmap, you will:

1. **Master Full-Stack Development** - Gain deep expertise in both frontend and backend
2. **Learn Industry Best Practices** - Implement production-grade solutions
3. **Build a Portfolio-Worthy Project** - Create something impressive to show employers
4. **Understand Advanced Concepts** - Real-time, payments, analytics, moderation, and more
5. **Become a Better Engineer** - Learn to think critically about architecture and design

**Start today, commit every day, and in 10 weeks you'll have transformed Vidora into a truly industry-standard, feature-rich video platform that demonstrates your mastery of full-stack development.**

---

*Document created: October 15, 2026*
*Version: 1.0*
