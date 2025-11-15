const express = require('express');
const { Client } = require('pg');
const os = require('os');

const app = express();
const PORT = 3000;

// Configuración de la base de datos
const dbClient = new Client({
  host: 'database',
  database: 'bluegreen_db',
  user: 'admin',
  password: 'secret123',
  port: 5432,
});

// Conectar a la base de datos
dbClient.connect()
  .then(() => console.log('✅ Conectado a la base de datos'))
  .catch(err => console.error('❌ Error conectando a BD:', err));

// Middleware
app.use(express.json());

// Variables de entorno
const APP_VERSION = process.env.APP_VERSION || '1.0';
const APP_COLOR = process.env.APP_COLOR || 'blue';
const APP_NAME = process.env.APP_NAME || 'Default Environment';

// Página principal con información del entorno
app.get('/', (req, res) => {
  const backgroundColor = APP_COLOR === 'blue' ? '#0066cc' : '#00cc66';
  const textColor = '#ffffff';
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Blue-Green Deployment Demo</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 100%);
          color: ${textColor};
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          text-align: center;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }
        h1 { font-size: 3em; margin: 0; text-transform: uppercase; }
        .version { font-size: 1.5em; margin: 20px 0; }
        .info { font-size: 1.1em; opacity: 0.9; margin: 10px 0; }
        .badge {
          display: inline-block;
          padding: 10px 20px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 25px;
          margin: 10px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 ${APP_NAME}</h1>
        <div class="version">Version ${APP_VERSION}</div>
        <div class="badge">Environment: ${APP_COLOR.toUpperCase()}</div>
        <div class="badge">Container: ${os.hostname()}</div>
        <div class="info">✅ Deployment Successful</div>
        <div class="info">Timestamp: ${new Date().toLocaleString()}</div>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    environment: APP_COLOR,
    version: APP_VERSION,
    timestamp: new Date().toISOString(),
    hostname: os.hostname()
  });
});

// API endpoint de ejemplo
app.get('/api/info', (req, res) => {
  res.json({
    service: APP_NAME,
    version: APP_VERSION,
    color: APP_COLOR,
    hostname: os.hostname(),
    uptime: process.uptime(),
    platform: process.platform,
    nodeVersion: process.version
  });
});

// Endpoint para probar la base de datos
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await dbClient.query('SELECT NOW() as current_time, version() as db_version');
    res.json({
      success: true,
      environment: APP_COLOR,
      database: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      environment: APP_COLOR,
      error: error.message
    });
  }
});

// Simulación de feature nueva en versión 2.0
app.get('/api/new-feature', (req, res) => {
  if (APP_VERSION === '2.0') {
    res.json({
      feature: 'Advanced Analytics',
      status: 'Available',
      description: 'Esta es una nueva característica solo disponible en la versión 2.0',
      environment: APP_COLOR
    });
  } else {
    res.status(404).json({
      feature: 'Advanced Analytics',
      status: 'Not Available',
      message: 'Esta característica está disponible solo en la versión 2.0',
      currentVersion: APP_VERSION
    });
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    environment: APP_COLOR,
    version: APP_VERSION
  });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║  🚀 Server Started Successfully       ║
  ╠════════════════════════════════════════╣
  ║  Environment: ${APP_COLOR.toUpperCase().padEnd(24)} ║
  ║  Version: ${APP_VERSION.padEnd(28)} ║
  ║  Port: ${PORT.toString().padEnd(31)} ║
  ║  Hostname: ${os.hostname().padEnd(25)} ║
  ╚════════════════════════════════════════╝
  `);
});

// Manejo de shutdown graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  dbClient.end();
  process.exit(0);
});