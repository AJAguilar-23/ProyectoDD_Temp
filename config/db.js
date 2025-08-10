import mysql from 'mysql2/promise'; // Importa el módulo mysql2 con soporte para promesas [1]
import dotenv from 'dotenv'; // Importa dotenv para cargar variables de entorno [1]

// Carga las variables de entorno si no han sido cargadas ya
// Esto asegura que process.env.DB_HOST, etc., estén disponibles
if (process.env.DB_HOST === undefined) { // [1]
    dotenv.config(); // [1]
}

// Crea el pool de conexiones a la base de datos MySQL [1]
const pool = mysql.createPool({
    host: process.env.DB_HOST, // Host de la base de datos, obtenido de las variables de entorno [1]
    port: process.env.DB_PORT, // Puerto de la base de datos [1]
    user: process.env.DB_USER, // Usuario de la base de datos [1]
    password: process.env.DB_PASSWORD, // Contraseña del usuario de la base de datos [1]
    database: process.env.DB_NAME, // Nombre de la base de datos [1]
    waitForConnections: true, // Si es true, las solicitudes esperarán a que haya una conexión disponible [1]
    connectionLimit: 10, // Número máximo de conexiones simultáneas en el pool [1]
    queueLimit: 0, // Número máximo de solicitudes en cola, 0 significa ilimitado [1]
    enableKeepAlive: true, // Mantiene las conexiones activas [1]
    // namedPlaceholders: true // (Opcional) Permite usar marcadores de posición con nombre en las consultas [1]
});

export default pool; // Exporta el pool de conexiones para ser usado en otros módulos [1]