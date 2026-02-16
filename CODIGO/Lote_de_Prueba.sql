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
('Bahi Blanca'),
('Mendoza'),
('Santa Fe');
GO

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

