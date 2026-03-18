-- ============================================================
-- Lote_de_Prueba.sql — adaptado a BD_Render.sql
-- ============================================================

INSERT INTO tipo_usuario (tipo) VALUES ('Administrador'), ('Cliente'), ('Repositor');

INSERT INTO tipo_cadena (tipo) VALUES ('Supermercado'), ('Mayorista');

INSERT INTO zona (nombre) VALUES
('GBA'), ('CABA'), ('Mar Del Plata'), ('Salta'), ('Misiones'),
('Chaco'), ('Neuquen'), ('Cordoba'), ('Bahia Blanca'), ('Mendoza'), ('Santa Fe');

INSERT INTO subzona (nombre, id_zona) VALUES
('Sur', 1), ('Oeste', 1), ('Norte', 1), ('Capital Federal', 2),
('Mar Del Plata', 3), ('Salta', 4), ('Posadas', 5), ('Resistencia', 6),
('Neuquen', 7), ('Cordoba', 8), ('Bahia Blanca', 9), ('Mendoza', 10), ('Rosario', 11);

INSERT INTO cadena (nombre, id_tipo) VALUES
('CARREFOUR', 1), ('MAKRO', 2), ('CHANGO MAS', 1), ('TOLEDO', 1),
('VITAL', 2), ('NINI', 2), ('YAGUAR', 2), ('JUMBO', 1);

-- CARREFOUR (id_cadena = 1)
INSERT INTO sucursal (calle, altura, localidad, id_subzona, id_cadena) VALUES
('Hipolito Irigoyen', 13499, 'Adrogue', 1, 1),
('La Plata Hiper', NULL, 'La Plata Hiper', 1, 1),
('Monte Grande', NULL, 'Monte Grande', 1, 1),
('Av. La Plata', 1400, 'Quilmes', 1, 1),
('Velez', NULL, 'Velez', 4, 1),
('San Fernando Hiper', NULL, 'San Fernando Hiper', 3, 1),
('Bdo De Irigoyen', 2647, 'San Isidro Hiper', 3, 1),
('Hiper', NULL, 'Vicente Lopez', 3, 1),
('Av. Lagomarsino', 905, 'Pilar', 3, 1),
('Arturo Illa', 3769, 'San Miguel', 3, 1),
('Av. Gaona', 21, 'Moreno', 2, 1),
('Tesei', NULL, 'Tesei', 2, 1),
('San Justo', NULL, 'San Justo', 2, 1),
('San Martin', 419, 'San Martin', 2, 1),
('Mar Del Plata Ruta', 2, 'Mar Del Plata', 5, 1),
('Circunvalacion Fischerton', NULL, 'Rosario', 13, 1),
('Guaymallen', NULL, 'Guaymallen', 12, 1),
('Av. Colon', 4880, 'Colon', 10, 1),
('Av. O''Higgins', 3700, 'Jardin', 10, 1);

-- MAKRO (id_cadena = 2)
INSERT INTO sucursal (calle, altura, localidad, id_subzona, id_cadena) VALUES
('Fiorito y F. Pienovi', NULL, 'Avellaneda', 1, 2),
('Quilmes', NULL, 'Quilmes', 1, 2),
('Guemes', 452, 'Haedo', 2, 2),
('Cerrito', 1110, 'Ituzaingo', 2, 2),
('J D Peron', 250, 'Lomas de Zamora', 1, 2),
('Panamerican y Ugarte', NULL, 'Olivos', 3, 2),
('Juan Manuel de Rosas', 3260, 'San Justo', 2, 2),
('Ruta Panamericana Pilar Km', 48, 'Pilar', 3, 2),
('Colectora Este Ramal Escobar', 41, 'Benavidez', 3, 2),
('Gral Paz y Constituyentes', NULL, 'San Martin', 3, 2),
('Av Circunvalacion', NULL, 'Rosario', 13, 2),
('Cordoba', NULL, 'Cordoba', 10, 2),
('Av. Champagnat Alvarado', NULL, 'Mar Del Plata', 5, 2),
('Rodriguez Pena', 790, 'Godoy Cruz', 12, 2),
('Av. Monsenor Tavella', NULL, 'Salta', 6, 2),
('Dir. Teodoro Planas', 4141, 'Neuquen', 9, 2);

-- CHANGO MAS (id_cadena = 3)
INSERT INTO sucursal (calle, altura, localidad, id_subzona, id_cadena) VALUES
('Av. Don Bosco', 5635, 'Moron', 2, 3),
('Av. Gaspar Campos', 5690, 'Jose C Paz', 2, 3),
('Av. Julio A. Roca', 3500, 'Moreno', 2, 3),
('Blvd. de los Italianos', 321, 'Lanus', 1, 3),
('Cerrito esquina Ruben Dario', NULL, 'Lomas de Zamora', 1, 3),
('Av. Lacaze', 3963, 'Claypole', 1, 3),
('Blvd. Tomas Espora', 2074, 'Adrogue', 1, 3),
('Av. de los Constituyentes', 6020, 'CABA', 4, 3);

-- TOLEDO (id_cadena = 4)
INSERT INTO sucursal (calle, altura, localidad, id_subzona, id_cadena) VALUES
('Falucho', 2007, 'Mar Del Plata', 5, 4),
('Saavedra', 2602, 'Mar Del Plata', 5, 4),
('Av. Libertad', 5750, 'Mar Del Plata', 5, 4),
('Av. Juan B. Justo', 750, 'Mar Del Plata', 5, 4),
('Saavedra', 2602, 'Mar Del Plata', 5, 4),
('Balcarce', 3902, 'Mar Del Plata', 5, 4);

-- VITAL (id_cadena = 5)
INSERT INTO sucursal (calle, altura, localidad, id_subzona, id_cadena) VALUES
('Au Acceso Oeste y Cruce Graham Bell', NULL, 'Merlo', 2, 5),
('RN3 km 25', 1757, 'Laferrere', 2, 5),
('Av. Bernabe Marquez', 969, 'Loma Hermosa', 2, 5),
('Ruta 8 km', 35, 'Malvinas', 3, 5),
('Espana', 1059, 'El Talar', 3, 5),
('Panamericana Km', 49, 'Pilar', 3, 5),
('Av. 520', 2650, 'La Plata', 1, 5),
('Av. Calchaqui', 1000, 'Quilmes', 1, 5),
('Av. Monteverde', 4100, 'Burzaco', 1, 5),
('Francisco Pienovi', 269, 'Avellaneda', 1, 5),
('Tronador', 400, 'Villa Ortuzar', 4, 5),
('Gallo', 149, 'Abasto', 4, 5),
('Av. Monsenor Bufano', 2900, 'San Justo', 2, 5),
('RN22 Km', 1218, 'Neuquen', 9, 5),
('Ruta 3 Km', 690, 'Bahia Blanca', 11, 5),
('Av. Pres. Peron', 1899, 'Mar Del Plata', 5, 5),
('Av. Paraguay', 2259, 'Salta', 6, 5),
('Ruta 12 Km', 6, 'Posadas', 7, 5),
('Ruta Nacional 16 Km', 15, 'Resistencia', 8, 5);

-- NINI (id_cadena = 6)
INSERT INTO sucursal (calle, altura, localidad, id_subzona, id_cadena) VALUES
('Av. 520', 2800, 'La Plata', 1, 6),
('Au Cam. del Buen Ayre KM', 30, 'San Justo', 2, 6);

-- YAGUAR (id_cadena = 7)
INSERT INTO sucursal (calle, altura, localidad, id_subzona, id_cadena) VALUES
('Av. Juan Bautista Alberdi', 4550, 'CABA', 4, 7),
('Av. Crisologo Larralde', 2109, 'Tigre', 3, 7),
('Km 38 Au Acceso Oeste', 38, 'Moreno', 2, 7),
('Ruta Panamericana Km', 42, 'Mashcwitz', 2, 7),
('Ruta Prov. N24', 24, 'Escobar', 3, 7);

-- JUMBO (id_cadena = 8)
INSERT INTO sucursal (calle, altura, localidad, id_subzona, id_cadena) VALUES
('Las Magnolias', 698, 'Pilar', 3, 8),
('Parana UNICENTER', 3745, 'Martinez', 3, 8),
('Av. Gral. Francisco Fernandez', 4602, 'San Isidro', 3, 8),
('Av. Calchaqui', 3950, 'Quilmes', 1, 8),
('Av. Int. Bullrich', 345, 'Palermo', 4, 8);

-- USUARIOS
-- Administrador (id=1)
INSERT INTO usuario (nombre, id_tipo_usuario, mail, usuario, clave) VALUES
('ADMIN', 1, 'admin@solvens.com', 'admin', 'admin1234');

-- Clientes (id=2 al 7)
INSERT INTO usuario (nombre, id_tipo_usuario, mail, usuario, clave) VALUES
('FABRICA JUSTO',    2, 'fabricajusto@cliente.com',   'fabricajusto',    'fabricajusto1234'),
('GOLOCAN',          2, 'golocan@cliente.com',         'golocan',         'golocan1234'),
('BONGIOVANNI',      2, 'bongiovanni@cliente.com',     'bongiovanni',     'bongiovanni1234'),
('PRODUCTOS CARILO', 2, 'productoscarilo@cliente.com', 'productoscarilo', 'productoscarilo1234'),
('317',              2, '317@cliente.com',             '317',             '3171234'),
('DEL VALLE',        2, 'delvalle@cliente.com',        'delvalle',        'delvalle1234');

-- Repositores (id=8 al 10)
INSERT INTO usuario (nombre, id_tipo_usuario, mail, usuario, clave) VALUES
('REPOSITOR UNO',  3, 'repo1@solvens.com', 'repo1', 'repo1234'),
('REPOSITOR DOS',  3, 'repo2@solvens.com', 'repo2', 'repo1234'),
('REPOSITOR TRES', 3, 'repo3@solvens.com', 'repo3', 'repo1234');

-- ABASTECE - FABRICA JUSTO (id=2, MAKRO)
INSERT INTO abastece (id_cliente, id_sucursal) VALUES
(2,20),(2,21),(2,22),(2,23),(2,24),(2,25),(2,26),(2,29),(2,30),(2,31),(2,32),(2,33),(2,34);

-- ABASTECE - GOLOCAN (id=3, CARREFOUR + CHANGO MAS)
INSERT INTO abastece (id_cliente, id_sucursal) VALUES
(3,1),(3,2),(3,3),(3,4),(3,5),(3,6),(3,7),(3,8),(3,9),(3,10),
(3,11),(3,12),(3,13),(3,14),(3,36),(3,37),(3,38),(3,39),(3,40),(3,41),(3,42),(3,43);

-- ABASTECE - BONGIOVANNI (id=4, CARREFOUR completo)
INSERT INTO abastece (id_cliente, id_sucursal) VALUES
(4,1),(4,2),(4,3),(4,4),(4,5),(4,6),(4,7),(4,8),(4,9),(4,10),
(4,11),(4,12),(4,13),(4,14),(4,15),(4,16),(4,17),(4,18),(4,19);

-- ABASTECE - PRODUCTOS CARILO (id=5, TOLEDO)
INSERT INTO abastece (id_cliente, id_sucursal) VALUES
(5,44),(5,45),(5,46),(5,47),(5,48),(5,49);

-- ABASTECE - 317 (id=6, MAKRO+CHANGO MAS+VITAL+NINI+YAGUAR)
INSERT INTO abastece (id_cliente, id_sucursal) VALUES
(6,20),(6,21),(6,22),(6,23),(6,24),(6,25),(6,26),(6,27),(6,28),(6,29),
(6,36),(6,37),(6,38),(6,39),(6,40),(6,41),(6,42),
(6,50),(6,51),(6,52),(6,53),(6,54),(6,55),(6,56),(6,57),(6,58),(6,59),
(6,60),(6,61),(6,62),(6,63),(6,64),(6,65),(6,66),(6,67),(6,68),
(6,69),(6,70),(6,71),(6,72),(6,73),(6,74),(6,75);

-- ABASTECE - DEL VALLE (id=7, MAKRO+VITAL+JUMBO)
INSERT INTO abastece (id_cliente, id_sucursal) VALUES
(7,25),(7,27),(7,28),(7,30),(7,35),
(7,50),(7,51),(7,55),(7,58),(7,59),
(7,76),(7,77),(7,78),(7,79),(7,80);
