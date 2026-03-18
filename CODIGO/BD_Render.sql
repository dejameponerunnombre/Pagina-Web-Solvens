CREATE TABLE tipo_usuario ( 
    id   SMALLSERIAL PRIMARY KEY,
    tipo VARCHAR(15) NOT NULL
);

CREATE TABLE tipo_cadena (
    id   SMALLSERIAL PRIMARY KEY,
    tipo VARCHAR(30) NOT NULL
);

CREATE TABLE zona (
    id     SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(25) NOT NULL
);

CREATE TABLE subzona (
    id      SMALLSERIAL PRIMARY KEY,
    nombre  VARCHAR(25) NOT NULL,
    id_zona SMALLINT NOT NULL,
    CONSTRAINT fk_subzona_zona 
        FOREIGN KEY (id_zona) REFERENCES zona(id)
);

CREATE TABLE usuario (
    id               SERIAL PRIMARY KEY,
    nombre           VARCHAR(40) NOT NULL,
    id_tipo_usuario  SMALLINT NOT NULL,
    mail             VARCHAR(70) NOT NULL UNIQUE,
    usuario          VARCHAR(40) NOT NULL UNIQUE,
    clave            VARCHAR(200) NOT NULL,
    CONSTRAINT fk_usuario_tipo 
        FOREIGN KEY (id_tipo_usuario) REFERENCES tipo_usuario(id)
);

CREATE TABLE cadena (
    id      SMALLSERIAL PRIMARY KEY,
    nombre  VARCHAR(20) NOT NULL,
    id_tipo SMALLINT NOT NULL,
    CONSTRAINT fk_cadena_tipo 
        FOREIGN KEY (id_tipo) REFERENCES tipo_cadena(id)
);

CREATE TABLE sucursal (
    id          SERIAL PRIMARY KEY,
    calle       VARCHAR(40) NOT NULL,
    altura      INT CHECK (altura IS NULL OR altura > 0),
    localidad   VARCHAR(40) NOT NULL,
    id_subzona  SMALLINT NOT NULL,
    id_cadena   SMALLINT NOT NULL,
    CONSTRAINT fk_sucursal_subzona 
        FOREIGN KEY (id_subzona) REFERENCES subzona(id),
    CONSTRAINT fk_sucursal_cadena 
        FOREIGN KEY (id_cadena) REFERENCES cadena(id) ON DELETE CASCADE
);

CREATE TABLE categoria (
    id        SMALLSERIAL PRIMARY KEY,
    categoria VARCHAR(50) NOT NULL
);

CREATE TABLE producto (
    id           SERIAL PRIMARY KEY,
    id_cliente   INT NOT NULL,
    descripcion  VARCHAR(60) NOT NULL,
    id_categoria SMALLINT NOT NULL,
    sku          VARCHAR(80) UNIQUE,
    CONSTRAINT fk_producto_cliente 
        FOREIGN KEY (id_cliente) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_producto_categoria 
        FOREIGN KEY (id_categoria) REFERENCES categoria(id) ON DELETE CASCADE
);

CREATE TABLE visita (
    id           SERIAL PRIMARY KEY,
    fecha        DATE NOT NULL CHECK (fecha <= CURRENT_DATE),
    id_repo      INT NOT NULL,
    id_cliente   INT NOT NULL,
    id_sucursal  INT NOT NULL,
    CONSTRAINT fk_visita_repo 
        FOREIGN KEY (id_repo) REFERENCES usuario(id),
    CONSTRAINT fk_visita_cliente 
        FOREIGN KEY (id_cliente) REFERENCES usuario(id),
    CONSTRAINT fk_visita_sucursal 
        FOREIGN KEY (id_sucursal) REFERENCES sucursal(id)
);

CREATE TABLE carga (
    id          SERIAL PRIMARY KEY,
    precio      NUMERIC(10,2) NOT NULL CHECK (precio > 0),
    id_producto INT NOT NULL,
    id_visita   INT NOT NULL,
    oferta      BOOLEAN DEFAULT FALSE,
    estado      VARCHAR(15),
    CONSTRAINT fk_carga_producto 
        FOREIGN KEY (id_producto) REFERENCES producto(id),
    CONSTRAINT fk_carga_visita 
        FOREIGN KEY (id_visita) REFERENCES visita(id) ON DELETE CASCADE
);

CREATE TABLE imagen (
    id           SERIAL PRIMARY KEY,
    ruta_imagen  VARCHAR(255) NOT NULL,
    id_visita    INT NOT NULL,
    estado       VARCHAR(20) DEFAULT 'Pendiente',
    CONSTRAINT fk_imagen_visita 
        FOREIGN KEY (id_visita) REFERENCES visita(id) ON DELETE CASCADE
);

CREATE TABLE abastece (
    id           SERIAL PRIMARY KEY,
    id_cliente   INT NOT NULL,
    id_sucursal  INT NOT NULL,
    CONSTRAINT fk_abastece_cliente 
        FOREIGN KEY (id_cliente) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_abastece_sucursal 
        FOREIGN KEY (id_sucursal) REFERENCES sucursal(id) ON DELETE CASCADE
);

CREATE INDEX idx_subzona_zona        ON subzona(id_zona);
CREATE INDEX idx_usuario_tipo        ON usuario(id_tipo_usuario);
CREATE INDEX idx_cadena_tipo         ON cadena(id_tipo);
CREATE INDEX idx_sucursal_subzona    ON sucursal(id_subzona);
CREATE INDEX idx_sucursal_cadena     ON sucursal(id_cadena);
CREATE INDEX idx_producto_cliente    ON producto(id_cliente);
CREATE INDEX idx_producto_categoria  ON producto(id_categoria);
CREATE INDEX idx_visita_repo         ON visita(id_repo);
CREATE INDEX idx_visita_cliente      ON visita(id_cliente);
CREATE INDEX idx_visita_sucursal     ON visita(id_sucursal);
CREATE INDEX idx_carga_producto      ON carga(id_producto);
CREATE INDEX idx_carga_visita        ON carga(id_visita);
CREATE INDEX idx_imagen_visita       ON imagen(id_visita);
CREATE INDEX idx_abastece_cliente    ON abastece(id_cliente);
CREATE INDEX idx_abastece_sucursal   ON abastece(id_sucursal);
