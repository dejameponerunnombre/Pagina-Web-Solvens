if db_id('Sistema_Solvens') is null
	create database Sistema_Solvens collate Latin1_General_CI_AS;
go



use Sistema_Solvens
go

CREATE TABLE Tipo_Usuario
(
	ID tinyint identity(1,1),
	Tipo varchar(15),
	Constraint PK_Tipo_Usuario Primary Key(ID)
);

CREATE TABLE Usuario
(
	ID tinyint identity(1,1),
	Nombre varchar(40),
	ID_Tipo_Usuario tinyint,
	Mail varchar(50),
	Usuario varchar(40),
	Clave varchar(40),
	Constraint PK_Usuario Primary Key(ID),
	Constraint FK_Usuario_Tipo_Usuario Foreign Key (ID_Tipo_Usuario) References Tipo_Usuario(ID)
);

CREATE TABLE Cadena
(
	ID tinyint identity(1,1),
	Nombre varchar(20),
	Constraint PK_Cadena Primary Key(ID)
);

CREATE TABLE Sucursal
(
	ID tinyint identity(1,1),
	Calle varchar(40),
	Altura int,
	Localidad varchar(40),
	Provincia varchar(40),
	Region varchar(40),
	ID_Cadena tinyint,
	Constraint PK_Sucursal Primary Key(ID),
	Constraint FK_Sucursal_Cadena Foreign Key (ID_Cadena) References Cadena(ID),
	Constraint CHK_Sucursal_Direccion CHECK (Altura > 0)
);

CREATE TABLE Categoria
(
	ID tinyint identity(1,1),
	Categoria varchar(50),
	Constraint PK_Categoria Primary Key(ID)
);

CREATE TABLE Cliente
(
	ID tinyint identity(1,1),
	Nombre varchar(50),
	ID_Usuario tinyint,
	Constraint PK_Cliente Primary Key(ID),
	Constraint FK_Cliente_Usuario Foreign Key (ID_Usuario) References Usuario(ID)
);

CREATE TABLE Producto
(
	ID tinyint identity(1,1),
	ID_Cliente tinyint,
	Descripcion varchar(60),
	ID_Categoria tinyint,
	SKU varchar(80),
	Constraint PK_Producto Primary Key(ID),
	Constraint FK_Producto_Cliente Foreign Key (ID_Cliente) References Cliente(ID),
	Constraint FK_Producto_Categoria Foreign Key (ID_Categoria) References Categoria(ID)
);

CREATE TABLE Visita
(
	ID tinyint identity(1,1),
	Fecha date,
	ID_Usuario tinyint,
	ID_Sucursal tinyint,
	Constraint PK_Visita Primary Key(ID),
	Constraint FK_Visita_Usuario Foreign Key (ID_Usuario) References Usuario(ID),
	Constraint FK_Visita_Sucursal Foreign Key (ID_Sucursal) References Sucursal(ID)
);

CREATE TABLE Carga
(
	ID tinyint identity(1,1),
	Precio decimal(10,2),
	ID_Producto tinyint,
	ID_Visita tinyint,
	Constraint PK_Carga Primary Key(ID),
	Constraint FK_Carga_Producto Foreign Key (ID_Producto) References Producto(ID),
	Constraint FK_Carga_Visita Foreign Key (ID_Visita) References Visita(ID)
);

CREATE TABLE Imagen
(
	ID tinyint identity(1,1),
	Ruta_Imagen varchar(100),
	ID_Visita tinyint,
	Constraint PK_Imagen Primary Key(ID),
	Constraint FK_Imagen_Visita Foreign Key (ID_Visita) References Visita(ID)
);

INSERT INTO Tipo_Usuario (Tipo) VALUES
('Administrador'),
('Cliente'),
('Repositor');
