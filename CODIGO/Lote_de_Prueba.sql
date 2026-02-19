use Sistema_Solvens
go


INSERT INTO Tipo_Usuario (Tipo) VALUES
('Administrador'),
('Cliente'),
('Repositor');

INSERT INTO Tipo_Cadena (Tipo) VALUES
('Supermercado'),
('Mayorista');


INSERT INTO Zona (Nombre) VALUES
('GBA'),
('CABA'),
('Mar Del Plata'),
('Salta'),
('Misiones'),
('Chaco'),
('Neuquen'),
('Cordoba'),
('Bahia Blanca'),
('Mendoza'),
('Santa Fe');
GO
Select * from Carga
Select * from Visita
Select * from Imagen
INSERT INTO Subzona (Nombre, ID_Zona) VALUES
('Sur', 1),
('Oeste', 1),
('Norte', 1),
('Capital Federal', 2),
('Mar Del Plata', 3),
('Salta', 4),
('Posadas', 5),
('Resistencia', 6),
('Neuquen', 7),
('Cordoba', 8),
('Bahi Blanca', 9),
('Mendoza', 10),
('Rosario', 11);




-- ============================================================================
-- TABLA: Cadena
-- ============================================================================

INSERT INTO Cadena (Nombre, ID_Tipo) VALUES
('CARREFOUR', 1),   -- Supermercado
('MAKRO', 2),       -- Mayorista
('CHANGO MAS', 1),  -- Supermercado
('TOLEDO', 1),      -- Supermercado
('VITAL', 2),       -- Mayorista
('NINI', 2),        -- Mayorista
('YAGUAR', 2),      -- Mayorista
('JUMBO', 1);       -- Supermercado
GO

-- ============================================================================
-- TABLA: Sucursal
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CARREFOUR (ID_Cadena = 1) - 19 sucursales
-- ----------------------------------------------------------------------------
INSERT INTO Sucursal (Calle, Altura, Localidad, ID_Subzona, ID_Cadena) VALUES
('Hipólito Irigoyen', 13499, 'Adrogue', 1, 1),
('La Plata Híper', NULL, 'La Plata Híper', 1, 1),
('Monte Grande', NULL, 'Monte Grande', 1, 1),
('Av. La Plata', 1400, 'Quilmes', 1, 1),
('Vélez', NULL, 'Vélez', 4, 1),
('San Fernando Híper', NULL, 'San Fernando Híper', 3, 1),
('Bdo De Irigoyen', 2647, 'San Isidro Híper', 3, 1),
('Híper', NULL, 'Vicente López', 3, 1),
('Av. Lagomarsino', 905, 'Pilar', 3, 1),
('Arturo Illa', 3769, 'San Miguel', 3, 1),
('Av. Gaona', 21, 'Moreno', 2, 1),
('Tesei', NULL, 'Tesei', 2, 1),
('San Justo', NULL, 'San Justo', 2, 1),
('San Martín', 419, 'San Martín', 2, 1),
('Mar Del Plata Ruta', 2, 'Mar Del Plata', 5, 1),
('Circunvalación Fischerton', NULL, 'Rosario', 13, 1),
('Guaymallen', NULL, 'Guaymallen', 12, 1),
('Av. Colón', 4880, 'Colón', 10, 1),
('Av. O''Higgins', 3700, 'Jardín', 10, 1);
GO

-- ----------------------------------------------------------------------------
-- MAKRO (ID_Cadena = 2) - 16 sucursales
-- ----------------------------------------------------------------------------
INSERT INTO Sucursal (Calle, Altura, Localidad, ID_Subzona, ID_Cadena) VALUES
('Fiorito y F. Pienovi', NULL, 'Avellaneda', 1, 2),
('Quilmes', NULL, 'Quilmes', 1, 2),
('Guemes', 452, 'Haedo', 2, 2),
('Cerrito', 1110, 'Ituzaingo', 2, 2),
('J D Perón', 250, 'Lomas de Zamora', 1, 2),
('Panamerican y Ugarte', NULL, 'Olivos', 3, 2),
('Juan Manuel de Rosas', 3260, 'San Justo', 2, 2),
('Ruta Panamericana Pilar Km', 48, 'Pilar', 3, 2),
('Colectora Este Ramal Escobar', 41, 'Benavidez', 3, 2),
('Gral Paz y Constituyentes', NULL, 'San Martín', 3, 2),
('Av Circunvalación', NULL, 'Rosario', 13, 2),
('Córdoba', NULL, 'Córdoba', 10, 2),
('Av. Champagnat Alvarado', NULL, 'Mar Del Plata', 5, 2),
('Rodríguez Peña', 790, 'Godoy Cruz', 12, 2),
('Av. Monseñor Tavella', NULL, 'Salta', 6, 2),
('Dir. Teodoro Planas', 4141, 'Neuquen', 9, 2);
GO

-- ----------------------------------------------------------------------------
-- CHANGO MAS (ID_Cadena = 3) - 8 sucursales
-- ----------------------------------------------------------------------------
INSERT INTO Sucursal (Calle, Altura, Localidad, ID_Subzona, ID_Cadena) VALUES
('Av. Don Bosco', 5635, 'Moron', 2, 3),
('Av. Gaspar Campos', 5690, 'José C Paz', 2, 3),
('Av. Julio A. Roca', 3500, 'Moreno', 2, 3),
('Blvd. de los Italianos', 321, 'Lanus', 1, 3),
('Cerrito esquina Ruben Dario', NULL, 'Lomas de Zamora', 1, 3),
('Av. Lacaze', 3963, 'Claypole', 1, 3),
('Blvd. Tomás Espora', 2074, 'Adrogué', 1, 3),
('Av. de los Constituyentes', 6020, 'CABA', 4, 3);
GO

-- ----------------------------------------------------------------------------
-- TOLEDO (ID_Cadena = 4) - 6 sucursales
-- ----------------------------------------------------------------------------
INSERT INTO Sucursal (Calle, Altura, Localidad, ID_Subzona, ID_Cadena) VALUES
('Falucho', 2007, 'Mar Del Plata', 5, 4),
('Saavedra', 2602, 'Mar Del Plata', 5, 4),
('Av. Libertad', 5750, 'Mar Del Plata', 5, 4),
('Av. Juan B. Justo', 750, 'Mar Del Plata', 5, 4),
('Saavedra', 2602, 'Mar Del Plata', 5, 4),
('Balcarce', 3902, 'Mar Del Plata', 5, 4);
GO

-- ----------------------------------------------------------------------------
-- VITAL (ID_Cadena = 5) - 19 sucursales
-- ----------------------------------------------------------------------------
INSERT INTO Sucursal (Calle, Altura, Localidad, ID_Subzona, ID_Cadena) VALUES
('Au Acceso Oeste y Cruce Graham Bell', NULL, 'Merlo', 2, 5),
('RN3 km 25', 1757, 'Laferrere', 2, 5),
('Av. Bernabé Márquez', 969, 'Loma Hermosa', 2, 5),
('Ruta 8 km', 35, 'Malvinas', 3, 5),
('España', 1059, 'El Talar', 3, 5),
('Panamericana Km', 49, 'Pilar', 3, 5),
('Av. 520', 2650, 'La Plata', 1, 5),
('Av. Calchaquí', 1000, 'Quilmes', 1, 5),
('Av. Monteverde', 4100, 'Burzaco', 1, 5),
('Francisco Pienovi', 269, 'Avellaneda', 1, 5),
('Tronador', 400, 'Villa Ortuzar', 4, 5),
('Gallo', 149, 'Abasto', 4, 5),
('Av. Monseñor Bufano', 2900, 'San Justo', 2, 5),
('RN22 Km', 1218, 'Neuquen', 9, 5),
('Ruta 3 Km', 690, 'Bahia Blanca', 11, 5),
('Av. Pres. Perón', 1899, 'Mar Del Plata', 5, 5),
('Av. Paraguay', 2259, 'Salta', 6, 5),
('Ruta 12 Km', 6, 'Posadas', 7, 5),
('Ruta Nacional 16 Km', 15, 'Resistencia', 8, 5);
GO

-- ----------------------------------------------------------------------------
-- NINI (ID_Cadena = 6) - 2 sucursales
-- ----------------------------------------------------------------------------
INSERT INTO Sucursal (Calle, Altura, Localidad, ID_Subzona, ID_Cadena) VALUES
('Av. 520', 2800, 'La Plata', 1, 6),
('Au Cam. del Buen Ayre KM', 30, 'San Justo', 2, 6);
GO

-- ----------------------------------------------------------------------------
-- YAGUAR (ID_Cadena = 7) - 5 sucursales
-- ----------------------------------------------------------------------------
INSERT INTO Sucursal (Calle, Altura, Localidad, ID_Subzona, ID_Cadena) VALUES
('Av. Juan Bautista Alberdi', 4550, 'CABA', 4, 7),
('Av. Crisólogo Larralde', 2109, 'Tigre', 3, 7),
('Km 38 Au Acceso Oeste', 38, 'Moreno', 2, 7),
('Ruta Panamericana Km', 42, 'Mashcwitz', 2, 7),
('Ruta Prov. N°24', 24, 'Escobar', 3, 7);
GO

-- ----------------------------------------------------------------------------
-- JUMBO (ID_Cadena = 8) - 5 sucursales
-- ----------------------------------------------------------------------------
INSERT INTO Sucursal (Calle, Altura, Localidad, ID_Subzona, ID_Cadena) VALUES
('Las Magnolias', 698, 'Pilar', 3, 8),
('Paraná UNICENTER', 3745, 'Martínez', 3, 8),
('Av. Gral. Francisco Fernández', 4602, 'San Isidro', 3, 8),
('Av. Calchaquí', 3950, 'Quilmes', 1, 8),
('Av. Int. Bullrich', 345, 'Palermo', 4, 8);
GO

INSERT INTO Usuario (Nombre, ID_Tipo_Usuario, Mail, Usuario, Clave) VALUES
('FABRICA JUSTO', 2, 'fabricajusto@cliente.com', 'fabricajusto', 'fabricajusto1234'),
('GOLOCAN', 2, 'golocan@cliente.com', 'golocan', 'golocan1234'),
('BONGIOVANNI', 2, 'bongiovanni@cliente.com', 'bongiovanni', 'bongiovanni1234'),
('PRODUCTOS CARILO', 2, 'productoscarilo@cliente.com', 'productoscarilo', 'productoscarilo1234'),
('317', 2, '317@cliente.com', '317', '3171234'),
('DEL VALLE', 2, 'delvalle@cliente.com', 'delvalle', 'delvalle1234');
GO

-- Verificar usuarios insertados
PRINT 'Usuarios (Clientes) insertados: 6';
SELECT * FROM Usuario WHERE ID_Tipo_Usuario = 2 ORDER BY ID;
GO
-- ============================================================================
-- TABLA: Abastece
-- Relaciona Clientes (Usuario) con Sucursales
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Cliente: FABRICA JUSTO (13 sucursales - MAKRO)
-- ----------------------------------------------------------------------------
INSERT INTO Abastece (ID_Cliente, ID_Sucursal) VALUES
(1, 20),  -- MAKRO - Avellaneda
(1, 21),  -- MAKRO - Quilmes
(1, 22),  -- MAKRO - Haedo
(1, 23),  -- MAKRO - Ituzaingo
(1, 24),  -- MAKRO - Lomas de Zamora
(1, 25),  -- MAKRO - Olivos
(1, 26),  -- MAKRO - San Justo
(1, 29),  -- MAKRO - Benavidez
(1, 30),  -- MAKRO - San Martín
(1, 31),  -- MAKRO - Rosario
(1, 32),  -- MAKRO - Córdoba
(1, 33),  -- MAKRO - Mar Del Plata
(1, 34);  -- MAKRO - Godoy Cruz
GO

-- ----------------------------------------------------------------------------
-- Cliente: GOLOCAN (22 sucursales - CARREFOUR y CHANGO MAS)
-- ----------------------------------------------------------------------------
INSERT INTO Abastece (ID_Cliente, ID_Sucursal) VALUES
(2, 1),   -- CARREFOUR - Adrogue
(2, 2),   -- CARREFOUR - La Plata Híper
(2, 3),   -- CARREFOUR - Monte Grande
(2, 4),   -- CARREFOUR - Quilmes
(2, 5),   -- CARREFOUR - Vélez
(2, 6),   -- CARREFOUR - San Fernando Híper
(2, 7),   -- CARREFOUR - San Isidro Híper
(2, 8),   -- CARREFOUR - Vicente López
(2, 9),   -- CARREFOUR - Pilar
(2, 10),  -- CARREFOUR - San Miguel
(2, 11),  -- CARREFOUR - Moreno
(2, 12),  -- CARREFOUR - Tesei
(2, 13),  -- CARREFOUR - San Justo
(2, 14),  -- CARREFOUR - San Martín
(2, 36),  -- CHANGO MAS - Moron
(2, 37),  -- CHANGO MAS - José C Paz
(2, 38),  -- CHANGO MAS - Moreno
(2, 39),  -- CHANGO MAS - Lanus
(2, 40),  -- CHANGO MAS - Lomas de Zamora
(2, 41),  -- CHANGO MAS - Claypole
(2, 42),  -- CHANGO MAS - Adrogué
(2, 43);  -- CHANGO MAS - CABA
GO

-- ----------------------------------------------------------------------------
-- Cliente: BONGIOVANNI (19 sucursales - CARREFOUR completo)
-- ----------------------------------------------------------------------------
INSERT INTO Abastece (ID_Cliente, ID_Sucursal) VALUES
(3, 1),   -- CARREFOUR - Adrogue
(3, 2),   -- CARREFOUR - La Plata Híper
(3, 3),   -- CARREFOUR - Monte Grande
(3, 4),   -- CARREFOUR - Quilmes
(3, 5),   -- CARREFOUR - Vélez
(3, 6),   -- CARREFOUR - San Fernando Híper
(3, 7),   -- CARREFOUR - San Isidro Híper
(3, 8),   -- CARREFOUR - Vicente López
(3, 9),   -- CARREFOUR - Pilar
(3, 10),  -- CARREFOUR - San Miguel
(3, 11),  -- CARREFOUR - Moreno
(3, 12),  -- CARREFOUR - Tesei
(3, 13),  -- CARREFOUR - San Justo
(3, 14),  -- CARREFOUR - San Martín
(3, 15),  -- CARREFOUR - Mar Del Plata
(3, 16),  -- CARREFOUR - Rosario
(3, 17),  -- CARREFOUR - Guaymallen
(3, 18),  -- CARREFOUR - Colón
(3, 19);  -- CARREFOUR - Jardín
GO

-- ----------------------------------------------------------------------------
-- Cliente: PRODUCTOS CARILO (6 sucursales - TOLEDO completo)
-- ----------------------------------------------------------------------------
INSERT INTO Abastece (ID_Cliente, ID_Sucursal) VALUES
(4, 44),  -- TOLEDO - Falucho
(4, 45),  -- TOLEDO - Saavedra
(4, 46),  -- TOLEDO - Av. Libertad
(4, 47),  -- TOLEDO - Av. Juan B. Justo
(4, 48),  -- TOLEDO - Saavedra (2)
(4, 49);  -- TOLEDO - Balcarce
GO

-- ----------------------------------------------------------------------------
-- Cliente: 317 (43 sucursales - MAKRO, CHANGO MAS, VITAL, NINI, YAGUAR)
-- ----------------------------------------------------------------------------
INSERT INTO Abastece (ID_Cliente, ID_Sucursal) VALUES
(5, 20),  -- MAKRO - Avellaneda
(5, 21),  -- MAKRO - Quilmes
(5, 22),  -- MAKRO - Haedo
(5, 23),  -- MAKRO - Ituzaingo
(5, 24),  -- MAKRO - Lomas de Zamora
(5, 25),  -- MAKRO - Olivos
(5, 26),  -- MAKRO - San Justo
(5, 27),  -- MAKRO - Pilar
(5, 28),  -- MAKRO - Benavidez
(5, 29),  -- MAKRO - San Martín
(5, 36),  -- CHANGO MAS - Moron
(5, 37),  -- CHANGO MAS - José C Paz
(5, 38),  -- CHANGO MAS - Moreno
(5, 39),  -- CHANGO MAS - Lanus
(5, 40),  -- CHANGO MAS - Lomas de Zamora
(5, 41),  -- CHANGO MAS - Claypole
(5, 42),  -- CHANGO MAS - Adrogué
(5, 50),  -- VITAL - Merlo
(5, 51),  -- VITAL - Laferrere
(5, 52),  -- VITAL - Loma Hermosa
(5, 53),  -- VITAL - Malvinas
(5, 54),  -- VITAL - El Talar
(5, 55),  -- VITAL - Pilar
(5, 56),  -- VITAL - La Plata
(5, 57),  -- VITAL - Quilmes
(5, 58),  -- VITAL - Burzaco
(5, 59),  -- VITAL - Avellaneda
(5, 60),  -- VITAL - Villa Ortuzar
(5, 61),  -- VITAL - Abasto
(5, 62),  -- VITAL - San Justo
(5, 63),  -- VITAL - Neuquen
(5, 64),  -- VITAL - Bahia Blanca
(5, 65),  -- VITAL - Mar Del Plata
(5, 66),  -- VITAL - Salta
(5, 67),  -- VITAL - Posadas
(5, 68),  -- VITAL - Resistencia
(5, 69),  -- NINI - La Plata
(5, 70),  -- NINI - San Justo
(5, 71),  -- YAGUAR - CABA
(5, 72),  -- YAGUAR - Tigre
(5, 73),  -- YAGUAR - Moreno
(5, 74),  -- YAGUAR - Mashcwitz
(5, 75);  -- YAGUAR - Escobar
GO

-- ----------------------------------------------------------------------------
-- Cliente: DEL VALLE (15 sucursales - MAKRO, VITAL, JUMBO)
-- ----------------------------------------------------------------------------
INSERT INTO Abastece (ID_Cliente, ID_Sucursal) VALUES
(6, 25),  -- MAKRO - Olivos
(6, 27),  -- MAKRO - Pilar
(6, 28),  -- MAKRO - Benavidez
(6, 30),  -- MAKRO - San Martín
(6, 35),  -- MAKRO - Neuquen
(6, 50),  -- VITAL - Merlo
(6, 51),  -- VITAL - Laferrere
(6, 55),  -- VITAL - Pilar
(6, 58),  -- VITAL - Burzaco
(6, 59),  -- VITAL - Avellaneda
(6, 76),  -- JUMBO - Pilar
(6, 77),  -- JUMBO - Martínez
(6, 78),  -- JUMBO - San Isidro
(6, 79),  -- JUMBO - Quilmes
(6, 80);  -- JUMBO - Palermo
GO

