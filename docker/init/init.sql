-- Crear tabla de usuarios
-- Esta tabla se mantiene similar al ejemplo, ya que la autenticación es un componente clave.
CREATE TABLE users (
    id BINARY(16) PRIMARY KEY, -- UUID BINARY(16) para IDs eficientes
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de publicaciones
-- Sustituye a la tabla 'movies' del ejemplo anterior.
CREATE TABLE publicaciones (
    id BINARY(16) PRIMARY KEY, -- ID único para cada publicación
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- Contenido de la publicación (similar a 'description' de 'movies')
    author_id BINARY(16) NOT NULL, -- ID del usuario que creó la publicación
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha y hora de creación
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Fecha y hora de la última actualización
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE -- Relación con la tabla de usuarios
);

-- Crear tabla de comentarios
-- Nueva tabla para gestionar los comentarios en las publicaciones.
CREATE TABLE comentarios (
    id BINARY(16) PRIMARY KEY, -- ID único para cada comentario
    content TEXT NOT NULL, -- Contenido del comentario
    publicacion_id BINARY(16) NOT NULL, -- ID de la publicación a la que pertenece el comentario
    user_id BINARY(16) NOT NULL, -- ID del usuario que hizo el comentario
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Fecha y hora de creación del comentario
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE, -- Relación con la tabla de publicaciones
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Relación con la tabla de usuarios
);

-- Insertar usuario de ejemplo
-- Este usuario se puede utilizar para pruebas iniciales de registro e inicio de sesión.
INSERT INTO users (id, name, email, phone, password_hash, must_change_password)
VALUES (
    UUID_TO_BIN('410eda32-99f1-43f7-b0bc-40a7937b2ee0'), -- Un UUID de ejemplo para el usuario
    'Axel Aguilar',
    'ajaguilarp@unah.hn',
    '+50499999999',
    '$2y$10$secrethash', -- **IMPORTANTE**: Este es un placeholder. Para un entorno real, debe ser un hash bcrypt válido de la contraseña deseada (ej. 'unah1234').
    true
);